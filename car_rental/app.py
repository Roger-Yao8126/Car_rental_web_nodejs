from dotenv import load_dotenv
from ariadne import graphql_sync, make_executable_schema, load_schema_from_path, ObjectType, QueryType
from ariadne.constants import PLAYGROUND_HTML
from flask import Flask, request, jsonify, make_response
from flask_restful import Api
from flask_cors import CORS
import jwt
import os
import socket

import resolver as r
from models import User

load_dotenv()
app = Flask(__name__)
app.config.from_object('config.Config')
CORS(app)

type_defs = load_schema_from_path('schema.graphql')

# Type
query = ObjectType("Query")
mutation = ObjectType("Mutation")
vehicle = ObjectType("Vehicle")
vehicle_type = ObjectType("VehicleType")
location = ObjectType("Location")
membership = ObjectType("Membership")
creditcardinfo = ObjectType("CreditCardInfo")
user = ObjectType("User")
token = ObjectType("Token")
Available_interval = ObjectType("Available_interval")
comment = ObjectType("Comment")

# Set Query fields
query.set_field("vehicles", r.getVehicles)
query.set_field("vehicle", r.getVehicle)
query.set_field("vehicle_types", r.getVehicleTypes)
query.set_field("vehicle_type", r.getVehicleType)
query.set_field("searchLocations", r.searchLocations)
query.set_field("location", r.getLocation)
query.set_field("membership", r.getMembership)
query.set_field("creditcardinfo", r.getCreditCardInfo)
query.set_field("user", r.getUser)
query.set_field("userbytoken", r.tokenGetUser)
query.set_field("searchUsers", r.searchUsers)
query.set_field("login", r.login)
query.set_field("get_available_time", r.get_available_time)
query.set_field("reservation",r.get_reservation)
query.set_field("reservations", r.search_reservations)
query.set_field("search_user_reservations", r.search_user_reservations)
query.set_field("parameter", r.getParameter)
query.set_field("parameterinfos", r.getAllParameterInfos)
query.set_field("parameterinfo", r.getParameterInfo)
query.set_field("checkReservationTimeAvailable", r.checkReservationTimeAvailable)
# Set Mutation fields

# Vehicle
mutation.set_field("addVehicle", r.addVehicle)
mutation.set_field("updateVehicle", r.updateVehicle)
mutation.set_field("delVehicle", r.delVehicle)

# Vehicle Type
mutation.set_field("addVehicleType", r.addVehicleType)
mutation.set_field("updateVehicleType", r.updateVehicleType)
mutation.set_field("delVehicleType", r.delVehicleType)

#reservation
mutation.set_field("generate_unpaid_reservation", r.add_unpaid_reservation)
mutation.set_field("token_add_reservation", r.token_add_reservation)
mutation.set_field("delReservation", r.delReservation)
mutation.set_field("user_pay_reservation", r.user_pay_reservation)
mutation.set_field("cancel_reservation", r.cancel_reservation)
mutation.set_field("updateReservation", r.updateReservation)
mutation.set_field("user_pickup_car", r.user_pickup_car)
mutation.set_field("user_return_car", r.user_return_car)
mutation.set_field("admin_close_reservation", r.admin_close_reservation)

# Location
mutation.set_field("addLocation", r.addLocation)
mutation.set_field("updateLocation", r.updateLocation)
mutation.set_field("delLocation", r.delLocation)

# Membership
# mutation.set_field("newMembership",r.addMembership)
mutation.set_field("delMembership", r.delMembership)
mutation.set_field("updateMembership", r.updateMembership)

# CreditCardInfo
#mutation.set_field("newCreditCardInfo", r.addCreditCardInfo)
mutation.set_field("delCreditCardInfo", r.delCreditCardInfo)
mutation.set_field("updateCreditCardInfo", r.updateCreditCardInfo)

# User
mutation.set_field("newUser", r.addUser)
mutation.set_field("delUser", r.delUser)
mutation.set_field("updateUser", r.updateUser)

# Comment
mutation.set_field("addComment", r.addComment)

# ParameterInfo
mutation.set_field("updateParameterInfo", r.updateParameterInfo)




schema = make_executable_schema(type_defs, [
                                query, vehicle, vehicle_type, location, membership, creditcardinfo, user, token, mutation])


hostname = socket.gethostname()
ip_address = socket.gethostbyname(hostname)

@app.route('/heart-beat', methods=['GET'])
def heartbeat():
    return { 'ok':True, 'host': ip_address }, 200

@app.route('/graphql', methods=['GET'])
def playground():
    return PLAYGROUND_HTML, 200

@app.route('/graphql', methods=['POST'])
def graphql_server():
    data = request.get_json()
    authorization = request.headers.get('Authorization')
    print("authorization is >>>", authorization)
    user = None
    secret = os.environ.get('JWT_SECRET')
    if(authorization != None):
        try:
            user_sub = jwt.decode(authorization, secret, algorithms=['HS256'])
            user = User.objects(id=user_sub['sub']).first()
        except:
            user = None
    success, result = graphql_sync(
        schema,
        data,
        context_value={'user': user},
        debug=app.debug
    )
    status_code = 200 if success else 400
    return jsonify(result), status_code


if __name__ == "__main__":
    with app.app_context():
        from database import init_db
        from waitress import serve
        init_db()
        app.run(port=5000, debug=True)
        #production
        #serve(app, host="localhost", port=5000)
        
