from mongoengine import connect
from datetime import datetime

from models import Vehicle
from flask import current_app


connect(host=current_app.config['DATABASE_URI'], alias='db1')
#connect(host='mongodb://localhost/test', alias='db1')
#connect(host='mongodb+srv://<db>:<password>@cluster0-9y5x5.mongodb.net/test?retryWrites=true&w=majority',alias='db1')


def init_db():
    pass
