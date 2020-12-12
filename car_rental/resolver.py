import json
import mongoengine
import heapq
from datetime import timedelta
from datetime import datetime
import math
import datetime
import pytz
import dateutil.parser
from bson.objectid import ObjectId
from models import Vehicle, Vehicletype, Membership, CreditCardInfo, User, Location, Available_interval, Comment, Reservation, ParameterInfo
import jwt
import os


def auth_required(func):
    def wrapper(_, info, **kwargs):
        if info.context['user'] is None:
            raise Exception("User not authenticated")

        return func(_, info, **kwargs)
    return wrapper


def admin_required(func):
    def wrapper(_, info, **kwargs):
        if info.context['user'] is None:
            raise Exception("User not authenticated")
        elif info.context['user'].role != "Admin":
            raise Exception("User do not have permission")
        else:
            return func(_, info, **kwargs)
    return wrapper

# get Reservation by Id,  may need get method via other field


def get_reservation(_, info, id):
    reservation = Reservation.objects(id=id).first()  # pylint: disable=maybe-no-member
    if (reservation == None):
        raise Exception("Reservation not found")
    return reservation


def getVehicles(_, info, **kwargs):
    print("kwargs>>", kwargs)
    '''
    new_dict=kwargs
    #got to be a better way of handling this

    if('default_hourly_rate' in new_dict):
        if('lte' in new_dict['default_hourly_rate']):
            new_dict['default_hourly_rate']['$lte'] = new_dict['default_hourly_rate']['lte']
            new_dict['default_hourly_rate'].pop('lte', None)
        elif('gte' in new_dict['default_hourly_rate']):
            new_dict['default_hourly_rate']['$lt'] = new_dict['default_hourly_rate']['lt']
            new_dict['default_hourly_rate'].pop('lt', None)
        elif('gte' in new_dict['default_hourly_rate']):
            new_dict['default_hourly_rate']['$gte'] = new_dict['default_hourly_rate']['gte']
            new_dict['default_hourly_rate'].pop('gte', None)
        elif('gte' in new_dict['default_hourly_rate']):
            new_dict['default_hourly_rate']['$gt'] = new_dict['default_hourly_rate']['gt']
            new_dict['default_hourly_rate'].pop('gt', None)
        else:
            new_dict.pop('default_hourly_rate')

    if('vehicle_type' in new_dict):
        new_dict['vehicle_type'] = ObjectId(new_dict['vehicle_type'])
    new_dict['is_active'] = {'$eq': True}
    print("new_dict>>>", new_dict)
    vehicles = Vehicle.objects(__raw__=new_dict)
    '''
    finalanswer = None
    is_active = {'is_active': True} if kwargs['is_active'] == True else {}

    finalanswer = Vehicle.objects(**is_active)
    five_location_list = []

    if 'location' in kwargs:
        current_location = Location.objects(name=kwargs["location"]).first()

        locList = current_location.geo["coordinates"]

        five_nearest_locations = Location.objects(geo__near=current_location.geo).limit(5)

        for loc in five_nearest_locations:
            five_location_list.append(loc.id)
        five_location_list.append(current_location.id)
        temp = []
        for x in finalanswer:
            if x.location and x.location.id in five_location_list:
                temp.append(x)
        finalanswer = temp

    if 'available_from' and 'to' in kwargs:
        temp = []
        for x in finalanswer:
            if internal_check_available(x, kwargs['available_from'], kwargs['to']):
                temp.append(x)
        finalanswer = temp

        if len(finalanswer) == 0:
            finalanswer = Vehicle.objects(**is_active)
            for x in finalanswer:
                if internal_check_available(x, kwargs['available_from'], kwargs['to']):
                    temp.append(x)
            finalanswer = temp

    if 'make' in kwargs:
        temp = []
        for x in finalanswer:
            if x.make == kwargs['make']:
                temp.append(x)
        finalanswer = temp

    if 'model' in kwargs:
        temp = []
        for x in finalanswer:
            if x.model == kwargs['model']:
                temp.append(x)
        finalanswer = temp

    if 'vehicle_type' in kwargs:
        temp = []
        for x in finalanswer:
            if x.vehicle_type and x.vehicle_type.name == kwargs['vehicle_type']:
                temp.append(x)
        # temp.append(Vehicle.objects(id='5e9ce5b2274f4797ca08e249'))
        finalanswer = temp

    if 'year' in kwargs:
        temp = []
        for x in finalanswer:
            if x.year == kwargs['year']:
                temp.append(x)
        finalanswer = temp

    if 'location' in kwargs:
        tempFinalAnswer = []
        current_location = Location.objects(name=kwargs["location"]).first()

        for x in finalanswer:
            if x.location == current_location:
                tempFinalAnswer.append(x)

        if len(tempFinalAnswer) == 0:
            return finalanswer
        else:
            return tempFinalAnswer

    return finalanswer


def getVehicle(_, info, **kwargs):
    print("getVehicle>>>", kwargs['id'])
    vehicle = Vehicle.objects(id=kwargs['id']).first()
    print("vehicle is >>>", vehicle)
    if (vehicle == None):
        raise Exception("Vehicle not found")
    return vehicle


def addVehicle(_, info, vehicle_type, **kwargs):
    new_dict = kwargs
    target_location = None
    if('location_id' in new_dict):
        target_location = Location.objects(id=new_dict['location_id']).first()
        new_dict.pop('location_id')
    vehicle_type = Vehicletype.objects(id=vehicle_type).first()
    vehicle = Vehicle(location=target_location, **new_dict)
    vehicle.vehicle_type = vehicle_type
    vehicle.save()
    return vehicle


def updateVehicle(_, info, **kwargs):
    new_dict = kwargs
    target_location = None
    if('location_id' in new_dict):
        target_location = Location.objects(id=new_dict['location_id']).first()
        new_dict.pop('location_id')
    updatedVehicle = Vehicle.objects(id=kwargs["id"]).first()
    updatedVehicle.update(location=target_location, **new_dict)
    updatedVehicle.reload()
    return updatedVehicle


def delVehicle(_, info, id):
    vehicleToDeactivate = Vehicle.objects(id=id).first()
    vehicleToDeactivate.update(is_active=False)
    vehicleToDeactivate.reload()
    return vehicleToDeactivate


def getVehicleTypes(_, info):
    vehicle_types = Vehicletype.objects()
    return vehicle_types


def getVehicleType(_, info, id):
    vehicle_type = Vehicletype.objects(id=id).first()
    return vehicle_type


def addVehicleType(_, info, **kwargs):
    vehicle_type = Vehicletype(**kwargs)
    vehicle_type.save()
    return vehicle_type


def updateVehicleType(_, info, id, **kwargs):
    vehicle_type = Vehicletype.objects(id=id).first()
    vehicle_type.update(**kwargs)
    vehicle_type.reload()
    return vehicle_type


def delVehicleType(_, info, id):
    vt = Vehicletype.objects(id=id).first()
    vt.delete()
    return vt


def search_reservations(_, info, **kwargs):
    new_dict = kwargs
    reservations = None
    if('user_id' in new_dict):
        user_id = new_dict['user_id']
        new_dict.pop('user_id')
        reservations = Reservation.objects(user=user_id, **new_dict)
    else:
        reservations = Reservation.objects(**new_dict)
    return reservations

def search_user_reservations(_,info, **kwargs):
    user = User.objects(id=info.context['user'].id).first()
    reservations = Reservation.objects(user=user.id, **kwargs)
    return reservations

def admin_close_reservation(_, info, id, **kwargs):
    reservation = Reservation.objects(id=id).first()
    reservation.update(status="closed", **kwargs)
    reservation.reload()
    return reservation

@auth_required
def add_unpaid_reservation(_, info, **kwargs):
    print("kwargs>>", kwargs)
    print("info.context['user']>>>", info.context['user'])
    current_price=0
    vehicle = Vehicle.objects(id=kwargs['vehicle_id']).first()
    user = User.objects(id=info.context['user'].id).first()
    parameter_list = ParameterInfo.objects()

    base_price = vehicle.default_hourly_rate

    start_time = dateutil.parser.parse(kwargs['start_time'])
    end_time = dateutil.parser.parse(kwargs['end_time'])
    delta = end_time-start_time

    if(delta.days>=3):
        #front end reject.
        print("reject")
    elif(delta.days>=1 and delta.days<=2):
        current_price+=delta.days*24*base_price
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="24h to 72h").first()).rate

    elif(delta.days<1 and math.ceil(delta.seconds/3600)>=11):
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="11h to 24h").first()).rate

    elif(delta.days<1 and math.ceil(delta.seconds/3600)>=6):
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="6h to 10h").first()).rate

    elif(delta.days<1 and math.ceil(delta.seconds/3600)<=5):
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="below 5h").first()).rate

    current_price*=vehicle.vehicle_type.hourly_rate

    new_reservation_dict = {
        "vehicle":vehicle,
        "user": user ,
        "start_time":kwargs['start_time'],
        "end_time":kwargs['end_time'],
        "actual_start_time":None,
        "actual_end_time":None,

        "normal_price": current_price,
        "penalty_fee":0,
        "status":"unpaid"
        }
    newreservation = Reservation(**new_reservation_dict)
    newreservation.save()

    return newreservation

@auth_required
def token_add_reservation(_, info, **kwargs):
    print("kwargs>>", kwargs)

    current_price=0
    vehicle = Vehicle.objects(id=kwargs['vehicle_id']).first()
    user = User.objects(id=info.context['user'].id).first()
    parameter_list = ParameterInfo.objects()

    base_price = vehicle.default_hourly_rate

    start_time = dateutil.parser.parse(kwargs['start_time'])
    end_time = dateutil.parser.parse(kwargs['end_time'])
    delta = end_time-start_time

    if(delta.days>=3):
        #front end reject.
        print("reject")
    elif(delta.days>=1 and delta.days<=2):
        current_price+=delta.days*24*base_price
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="24h to 72h").first()).rate

    elif(delta.days<1 and math.ceil(delta.seconds/3600)>=11):
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="11h to 24h").first()).rate

    elif(delta.days<1 and math.ceil(delta.seconds/3600)>=6):
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="6h to 10h").first()).rate

    elif(delta.days<1 and math.ceil(delta.seconds/3600)<=5):
        current_price+=math.ceil(delta.seconds/3600)*base_price
        current_price*=(ParameterInfo.objects(description="below 5h").first()).rate

    current_price*=vehicle.vehicle_type.hourly_rate

    new_reservation_dict = {
        "vehicle":vehicle,
        "user": user ,
        "start_time":kwargs['start_time'],
        "end_time":kwargs['end_time'],
        "actual_start_time":None,
        "actual_end_time":None,

        "normal_price": current_price,
        "penalty_fee":0,
        "status":"unpaid"
        }

#     print("user_id >>> ", user_id)
#     new_contract_dict.update({"user_id": user_id})
    newreservation = Reservation(**new_reservation_dict)
    newreservation.save()

    user = User.objects(id=info.context['user'].id).first()
    user.reservation.append(newreservation)
    user.save()
    print("user>>>", user.id)

    return newreservation

# user cancel reservation before paying
def delReservation(_, info, id):
    current_reservation = Reservation.objects(id=id).first()
    current_reservation.delete()
    return current_reservation

# user pay reservation by id
def user_pay_reservation(_, info, id):
    current_reservation = Reservation.objects(id=id).first()
    vehicle = current_reservation.vehicle
    vehicle.update(add_to_set__reservation=current_reservation)
    current_reservation.update(set__status="paid")
    vehicle.reload()
    current_reservation.reload()

    return current_reservation


# cancel reservation by id
def cancel_reservation(_, info, id):
    current_reservation = Reservation.objects(id=id).first()

    start_time = current_reservation.start_time
    delta = (datetime.datetime.now()) - start_time
    print(delta)
    print(delta.seconds)
    if(delta.seconds/3600>1 and delta.days>=0):
        print("in if")
        # not allowed, frontend reject.
        ## late penalty
        current_reservation.penalty_fee = 10

    vehicle = current_reservation.vehicle
    vehicle.update(pull__reservation=current_reservation)
    current_reservation.status ="canceled"
    current_reservation.save()
    current_reservation.reload()
    #current_reservation.delete()
    return current_reservation

# update Reservation by id

def updateReservation(_, info, **kwargs):
    updatedReservation = Reservation.objects(id=kwargs["id"]).first()  # get model
    updatedReservation.update(**kwargs)  # update model
    updatedReservation.reload()  # reload model
    return updatedReservation


# update reservation when user pickup car
def user_pickup_car(_, info, id, actual_start_time):
    current_reservation = Reservation.objects(id=id).first()
    current_reservation.update(status="pickup", actual_start_time=actual_start_time)
    current_reservation.reload()
    return current_reservation

# update reservation when user return car
def user_return_car(_,info, id, actual_end_time, comment):
    current_reservation = Reservation.objects(id=id).first()
    real_end_time = pytz.utc.localize(datetime.datetime.strptime(actual_end_time, "%Y-%m-%dT%H:%M:%S.%fZ"))
    original_end_time = pytz.utc.localize(current_reservation.end_time)
    delta = real_end_time - original_end_time
    if(delta.seconds/3600<0.1 and delta.days==0):
        current_reservation.update(set__status="returned", set__comment=comment, actual_end_time=actual_end_time)
        return current_reservation
    else:
        current_reservation.update(set__status="returned", set__comment=comment, actual_end_time=actual_end_time)
        vehicle = current_reservation.vehicle
        fee = vehicle.default_hourly_rate*math.ceil(delta.seconds/3600)+(ParameterInfo.objects(description="24h to 72h").first()).rate
        current_reservation.update(set__penalty_fee=fee)
        return current_reservation



# add location

def addLocation(_, info, **kwargs):
    print("kwargs>>", kwargs)
    new_location_dict = {x: kwargs[x] for x in kwargs}
    print("new_location_dict>>>", new_location_dict)
    newlocation = Location(**new_location_dict)
    newlocation.save()
    return newlocation

# search location
def searchLocations(_, info, **kwargs):
    locations = Location.objects(**kwargs)
    return locations

# get location
def getLocation(_, info,  id):
    location = Location.objects(id=id).first()
    if (location == None):
        raise Exception("Location not found")
    return location

# update location by id.


def updateLocation(_, info, **kwargs):
    updatedLocation = Location.objects(id=kwargs["id"]).first()  # get model
    updatedLocation.update(**kwargs)  # update model
    updatedLocation.reload()  # reload model
    return updatedLocation

# remove location by id


def delLocation(_, info, location_id):
    deletedLocation = Location.objects(id=location_id).first()
    deletedLocation.delete()
    return deletedLocation



def getMembership(_, info, id):
    membership = Membership.objects(
        id=id).first()  # pylint: disable=maybe-no-member
    if (membership == None):
        raise Exception("Membership not found")
    return membership


def getCreditCardInfo(_, info, id):
    CCI = CreditCardInfo.objects(
        id=id).first()  # pylint: disable=maybe-no-member
    if (CCI == None):
        raise Exception("Credit Card Info not found")
    return CCI


def getUser(_, info, id):
    user = User.objects(id=id).first()  # pylint: disable=maybe-no-member
    if (user == None):
        raise Exception("User not found")
    return user


@auth_required
def tokenGetUser(_, info):
    user = User.objects(id=info.context['user'].id).first()
    return user


def searchUsers(_, info, **kwargs):
    users = User.objects(**kwargs)
    return users


def addMembership(membership_dict):
    newMembership = Membership(
        #id = id,
        user_id=membership_dict.get('user_id'),
        start_date=membership_dict.get('start_date'),
        last_renew_date=membership_dict.get('last_renew_date'),
        is_active=membership_dict.get('is_active')
    )
    newMembership.save()
    return newMembership


def delMembership(_, info, id):
    deletedMembership = Membership.objects(id=id).first()
    deletedMembership.delete()
    return deletedMembership


def updateMembership(_, info, **kwargs):
    updatedMembership = Membership.objects(id=kwargs["id"]).first()
    updatedMembership.update(**kwargs)
    updatedMembership.reload()
    return updatedMembership


def addCreditCardInfo(creditcardinfoDict):
    newCreditCardInfo = CreditCardInfo(
        user_id=creditcardinfoDict.get('user_id'),
        credit_card_number=creditcardinfoDict.get('credit_card_number'),
        card_holder_name=creditcardinfoDict.get('card_holder_name'),
        billing_address=creditcardinfoDict.get('billing_address'),
        exp_date=creditcardinfoDict.get('exp_date')
    )
    newCreditCardInfo.save()
    return newCreditCardInfo


def delCreditCardInfo(_, info, id):
    deletedCreditCardInfo = CreditCardInfo.objects(id=id).first()
    deletedCreditCardInfo.delete()
    return deletedCreditCardInfo


def updateCreditCardInfo(_, info, **kwargs):
    updatedCreditCardInfo = CreditCardInfo.objects(id=kwargs["id"]).first()
    updatedCreditCardInfo.update(**kwargs)
    updatedCreditCardInfo.reload()
    return updatedCreditCardInfo

# add User


def addUser(_, info, **kwargs):
    print("kwargs>>", kwargs)
    for arg in kwargs:
        if arg == 'membership' and kwargs.get(arg):
            new_membership_dict = kwargs.get(arg)
            membership_model = addMembership(new_membership_dict)

        elif arg == 'credit_card_info' and kwargs.get(arg):
            new_creditcardinfo_dict = kwargs.get(arg)
            credit_card_model = addCreditCardInfo(new_creditcardinfo_dict)

    del kwargs['membership']
    del kwargs['credit_card_info']
    new_user_dictionary = {x: kwargs[x] for x in kwargs if x != 'user_id'}
    new_user_dictionary['membership'] = membership_model
    new_user_dictionary['credit_card_info'] = credit_card_model
    print("new_user_dict>>>", new_user_dictionary)
    newuser = User(**new_user_dictionary)
    newuser.save()
    secret = os.environ.get('JWT_SECRET')
    encoded = jwt.encode({'sub': str(newuser.id)}, secret, algorithm='HS256')
    return {'token': encoded.decode("utf-8"), 'role': newuser.role}


def delUser(_, info, user_id):
    deletedUser = User.objects(id=user_id).first()
    deletedUser.delete()
    return deletedUser

# @auth_required


def updateUser(_, info, **kwargs):
    updatedUser = User.objects(id=kwargs["id"]).first()
    updatedUser.update(**kwargs)
    updatedUser.reload()
    return updatedUser


def login(_, info, email, pw):
    user = User.objects(email=email).first()
    print("user is >>>", user)
    if user is None:
        raise Exception("User dosn't exist")
    
    if (pw != user.password):
        raise Exception("Wrong account or password")

    secret = os.environ.get('JWT_SECRET')
    encoded = jwt.encode({'sub': str(user.id)}, secret, algorithm='HS256')
    membership_expiration_date = None

    # check if user is active
    if user.is_active == False:
        raise Exception("User is deactivated. Please contact Admin to reactivate your account.")
    # check membership
    if user.role == 'Admin':
        membership_expiration_date = None  # never expire for admin
    elif user.membership is not None and user.membership.last_renew_date is not None:
        membership_expiration_date = (pytz.utc.localize(user.membership.last_renew_date) + datetime.timedelta(6*365/12)).isoformat()
    else:
        membership_expiration_date = datetime.datetime.now().isoformat()
    print("membership_expiration_date>>>", membership_expiration_date)
    print(user.membership, user.membership.last_renew_date)
    return {'token': encoded.decode("utf-8"), 'role': user.role, 'membership_expiration_date': membership_expiration_date}


def get_available_time(_, info, **kwargs):
    # convert input into date time obj
    check_start = datetime.dateutil.parser.parse(kwargs['start_time'])
    check_end = dateutil.parser.parse(kwargs['end_time'])
    intervalList = []

    # find vehicle
    vehicle = Vehicle.objects(id=kwargs['id']).first()

    for x in vehicle.reservation:
        reservation_id = x.id
        reservation = Reservation.objects(id=reservation_id).first()

        reservation_start = reservation.start_time
        reservation_end = reservation.end_time
        # not in range
        if(check_start >= reservation_end):
            continue
        if(check_end <= reservation_start):
            interval = Available_interval(
                available_from=check_start,
                to=check_end
            )
            intervalList.append(interval)
            break
        # left case
        if(check_start < reservation_start):
            interval = Available_interval(
                available_from=check_start,
                to=reservation_start
            )
            intervalList.append(interval)

        check_start = reservation_end

    if(check_start < check_end):
        interval = Available_interval(
            available_from=check_start,
            to=check_end
        )
        intervalList.append(interval)

    return intervalList


@auth_required
def addComment(_, info, vehicle_id, **kwargs):
    user = User.objects(id=info.context['user'].id).first()
    new_comment = Comment(**kwargs)
    new_comment.user = user
    new_comment.save()

    vehicle = Vehicle.objects(id=vehicle_id).first()
    vehicle.comments.append(new_comment)
    vehicle.save()
    return new_comment

def getAllParameterInfos(_, info):
    parameter_infos = ParameterInfo.objects()
    return parameter_infos

def getParameterInfo(_, info, id):
    parameter_info = ParameterInfo.objects(id=id).first()
    return parameter_info

def updateParameterInfo(_, info, id, **kwargs):
    parameter_info = ParameterInfo.objects(id=id).first()
    parameter_info.update(**kwargs)
    parameter_info.reload()
    return parameter_info

def checkReservationTimeAvailable(_, info, vehicle_id, available_from, available_to):
    vehicle = Vehicle.objects(id=vehicle_id).first()
    result = internal_check_available(
        vehicle,
        available_from,
        available_to
    )
    print("result is >>>", result)
    return result


def internal_check_available(a_car, available_from, to):
    check_start = pytz.utc.localize(datetime.datetime.strptime(available_from, "%Y-%m-%dT%H:%M:%S.%fZ"))
    check_end = pytz.utc.localize(datetime.datetime.strptime(to, "%Y-%m-%dT%H:%M:%S.%fZ"))
    intervalList = []

    for x in a_car.reservation:
        print(x.id)
        reservation_id = x.id
        reservation = Reservation.objects(id=reservation_id).first()

        reservation_start = pytz.utc.localize(reservation.start_time)
        reservation_end = pytz.utc.localize(reservation.end_time)
        # not in range
        if(check_start >= reservation_end):
            print(1)
            continue
        if(check_end <= reservation_start):
            print(2)
            interval = Available_interval(
                available_from=check_start,
                to=check_end
            )
            intervalList.append(interval)
            break
        # left case
        if(check_start < reservation_start):
            print(3)
            interval = Available_interval(
                available_from=check_start,
                to=reservation_start
            )
            intervalList.append(interval)

        check_start = reservation_end
        if len(intervalList) == 0:
            return False

    if(check_start < check_end):
        interval = Available_interval(
            available_from=check_start,
            to=check_end
        )
        intervalList.append(interval)

    if len(intervalList) == 0:
        return False
    else:
        return True


# @auth_required
def getParameter(_, info, description):
    parameterInfo = ParameterInfo.objects(description=description).first()  # pylint: disable=maybe-no-member
    if (parameterInfo == None):
        raise Exception("Parameter not found")
    return parameterInfo