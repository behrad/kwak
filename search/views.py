import json
from django.http import HttpResponse
from forms import MessageSearchForm

def search(request):
    query = request.GET.get('q', '')

    profile = request.user.profile
    teams = profile.teams.all().values_list('name', flat=True)

    # we retrieve the query to display it in the template
    form = MessageSearchForm(request.GET)

    # we call the search method from the MessageSearchForm. Haystack do the work!
    results = form.search()
    output = [{
        'content': o.text.split("\n", 2),
        'channel': o.channel,
        'url': o.thread_url
    } for o in results if o.team in teams]

    return HttpResponse(json.dumps({'results': output}), content_type='application/json')
