from flask import Flask
from flask.json import JSONEncoder
from bson import json_util
from mongoengine.base import BaseDocument
from mongoengine.queryset.base import BaseQuerySet


class MongoEngineJSONEncoder(JSONEncoder):
    def default(self,obj):
        if isinstance(obj, BaseDocument):
            return obj.to_json()
        elif isinstance(obj,BaseQuerySet):
            return json_util._json_convert(obj.as_pymongo())
        return JSONEncoder.default(self, obj)