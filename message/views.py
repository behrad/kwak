from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template import loader
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.views.generic import *
from message.forms import PasswordResetRequestForm, SetPasswordForm
from django.contrib import messages
from django.contrib.auth.models import User


class ResetPasswordRequestView(FormView):
    template_name = "reset_password_form.html"
    success_url = '/login'
    form_class = PasswordResetRequestForm

    @staticmethod
    def validate_email_address(email):
        try:
            validate_email(email)
            return True
        except ValidationError:
            return False

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST)
        if form.is_valid():
            data = form.cleaned_data["email"]

            if self.validate_email_address(data):
                associated_users = User.objects.filter(username=data)
                if associated_users.exists():
                    for user in associated_users:
                        c = {
                            'email': user.email,
                            'domain': 'kwak.io',
                            'site_name': 'kwak',
                            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                            'user': user,
                            'token': default_token_generator.make_token(user),
                            'protocol': 'https',
                            }
                        subject_template_name='registration/password_reset_subject.txt'
                        email_template_name='registration/password_reset_email.html'
                        subject = loader.render_to_string(subject_template_name, c)
                        # Email subject *must not* contain newlines
                        subject = ''.join(subject.splitlines())
                        email = loader.render_to_string(email_template_name, c)
                        send_mail(subject, email, 'noreply@kwak.io' , [user.email], fail_silently=False)
                    result = self.form_valid(form)
                    messages.success(request, 'Reset password instructions have been sent to ' + data)
                    return result
                result = self.form_invalid(form)
                messages.error(request, 'This email does not exist in the system.')
                return result
        messages.error(request, 'Please enter a valid email address.')
        return self.form_invalid(form)


class PasswordResetConfirmView(FormView):
    template_name = "reset_password_form.html"
    success_url = '/channels'
    form_class = SetPasswordForm

    def post(self, request, uidb64=None, token=None, *arg, **kwargs):
        """
        View that checks the hash in a password reset link and presents a
        form for entering a new password.
        """
        UserModel = get_user_model()
        form = self.form_class(request.POST)
        assert uidb64 is not None and token is not None  # checked by URLconf
        try:
            uid = urlsafe_base64_decode(uidb64)
            user = UserModel._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            if form.is_valid():
                new_password= form.cleaned_data['new_password2']
                user.set_password(new_password)
                user.save()
                messages.success(request, 'Password has been reset.')
                return self.form_valid(form)
            else:
                messages.error(request, 'Password mismatch.')
                return self.form_invalid(form)
        else:
            messages.error(request,'Invalid reset password link.')
            return self.form_invalid(form)
