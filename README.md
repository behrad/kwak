# Running the project
## Django
- `pip install -r requirements`
- Set the mailgun API key
- `python manage.py runserver` or use any wsgi server

## Ember
- `cd static`
- `npm install`
- `bower install`
- `ember build`
- Serve `dist` folder with nginx, sample config : https://gist.github.com/vhf/8b1ed741978a7e94b4f6

## Node
- `cd static/socketio-server`
- `node server.js`
