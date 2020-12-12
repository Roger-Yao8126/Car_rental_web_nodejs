import argparse
import random
import json
from pprint import pprint
from mongoengine import connect, disconnect



from models import Vehicletype

# init / consts
car_type_choices = ['small car', 'full-size car', 'truck', 'luxury car']
hourly_rate_parameter = [0.8, 1, 1.2, 2]

# script params
parser = argparse.ArgumentParser(description='Ingest car data from car data file.')
parser.add_argument('--mongo_db', default='car_rent', help='mongodb db to connect to')
parser.add_argument('--mongo_url', default='mongodb://localhost/car_rent', help='mongodb url to connect to')
args = parser.parse_args()

connect(args.mongo_db, host=args.mongo_url, alias='db1')

car_types = []
for x in range(4):
    car_type_model = Vehicletype(
        name=car_type_choices[x],
        hourly_rate = hourly_rate_parameter[x]
        )
    car_types.append(car_type_model)
    
Vehicletype.objects.insert(car_types)

disconnect(alias='db1')
