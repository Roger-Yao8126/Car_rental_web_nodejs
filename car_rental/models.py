from datetime import datetime
# from mongoengine import Document, EmbeddedDocument, ValidationError, ReferenceField
from mongoengine import *
import mongoengine_goodjson as gj
from mongoengine.fields import (
    DateTimeField,
    EmbeddedDocumentField,
    ListField,
    ReferenceField,
    StringField,
    BooleanField,
    IntField,
    FloatField,
    PointField
)


class Reservation(gj.Document):
    meta = {"collection": "reservation"}
    meta = {'db_alias': 'db1'}

    vehicle = ReferenceField('Vehicle')
    user = ReferenceField('User')

    start_time = DateTimeField(default=datetime.utcnow)
    end_time = DateTimeField(default=datetime.utcnow)
    actual_start_time = DateTimeField()
    actual_end_time = DateTimeField()

    normal_price = FloatField()
    penalty_fee = FloatField()
    status = StringField()
    comment = StringField()
    admin_note = StringField()



class Location(gj.Document):
    meta = {"collection": "location"}
    meta = {'db_alias': 'db1'}
    name = StringField()
    address = StringField()
    capacity = IntField()
    geo = PointField() # geo is {'type': 'Point', coordinates :[lng, lat]}

def _vehicle_type_validation(val):
    if val not in ["small car", "full-size car", "truck", "luxury car"]:
        raise ValidationError('value can not be empty')


class Vehicletype(gj.Document):
    meta = {"collection": "vehicle"}
    meta = {'db_alias': 'db1'}
    name = StringField()
    hourly_rate = FloatField()


class Comment(gj.Document):
    meta = {"collection": "comment"}
    meta = {'db_alias': 'db1'}
    comment_content = StringField()
    comment_time = DateTimeField(default=datetime.utcnow)
    user = ReferenceField('User')


CONDITION = ('new', 'like new', 'good', 'acceptable', 'need cleaning',
             'need maintenance', 'need repair')


class Vehicle(gj.Document):
    meta = {"collection": "vehicle"}
    meta = {'db_alias': 'db1'}
    vehicle_type = ReferenceField(Vehicletype, reverse_delete_rule=NULLIFY)
    default_hourly_rate = FloatField()
    make = StringField()
    model = StringField()
    year = IntField()
    registration_tag = StringField()
    current_mileage = FloatField()
    condition = StringField(choices=CONDITION)
    capacity = IntField()
    location = ReferenceField(Location)
    last_service_time = DateTimeField(default=datetime.utcnow)
    is_available = BooleanField(default=True)
    is_active = BooleanField(default=True)
    reservation = ListField(ReferenceField(
        Reservation, reverse_delete_rule=PULL))
    images = ListField(StringField())
    comments = ListField(ReferenceField(
        Comment, reverse_delete_rule=PULL))


class Membership(gj.Document):
    meta = {"collection": "membership"}
    meta = {'db_alias': 'db1'}
    #id = StringField()
    user_id = StringField()
    start_date = DateTimeField(default=datetime.utcnow)
    last_renew_date = DateTimeField()
    is_active = BooleanField(default=True)


class CreditCardInfo(gj.Document):
    meta = {"collection": "creditcardinfo"}
    meta = {'db_alias': 'db1'}
    user_id = ReferenceField('Membership._id')
    credit_card_number = StringField()
    card_holder_name = StringField()
    billing_address = StringField()
    exp_date = DateTimeField()


ROLE = ('Customer', 'Admin', 'Staff')
STATE = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
         'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']


class User(gj.Document):
    meta = {"collection": "user"}
    meta = {'db_alias': 'db1'}
    email = StringField()
    password = StringField()
    username = StringField()
    address = StringField()
    dl_state = StringField(max_length=2, choices=STATE)
    dl_number = StringField()
    #dl_info = ListField((dl_state, dl_number), unique = True)
    mobile_phone = StringField()
    age = IntField()
    registration_date = DateTimeField()
    credit_card_info = ReferenceField('CreditCardInfo')
    membership = ReferenceField('Membership')
    role = StringField(max_length=8, choices=ROLE)
    reservation = ListField(ReferenceField(
        Reservation, reverse_delete_rule=PULL))
    is_active = BooleanField(default=True)


class Available_interval(gj.Document):
    available_from = DateTimeField()
    to = DateTimeField()

class ParameterInfo(gj.Document):
    meta = {"collection": "vehicle"}
    meta = {'db_alias': 'db1'}
    description = StringField()
    rate = FloatField()


User.register_delete_rule(Reservation, 'user', CASCADE)
Vehicle.register_delete_rule(Reservation, 'vehicle', CASCADE)
