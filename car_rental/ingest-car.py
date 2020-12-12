import argparse
import random
import json
from pprint import pprint
from mongoengine import connect, disconnect
from datetime import datetime
from faker import Faker
from faker.providers import automotive

from models import Vehicle, Vehicletype, Location

# init / consts
fake = Faker()
fake.add_provider(automotive)
car_type_choices = ['small car', 'full-size car', 'truck', 'luxury car']
car_condition_choices = ['new', 'like new', 'acceptable', 'need maintenance']

# script params
parser = argparse.ArgumentParser(description='Ingest car data from car data file.')
parser.add_argument('--mongo_db', default='car_rent', help='mongodb db to connect to')
parser.add_argument('--mongo_url', default='mongodb://localhost/car_rent', help='mongodb url to connect to')
parser.add_argument('--data_file', default='./data/car.json', help='car json data file to import')
parser.add_argument('--num_cars', type=int, default=50, help='number of cars to import')
args = parser.parse_args()

def get_original_image(car_record):
    return car_record['originalImageUrl']

connect(args.mongo_db, host=args.mongo_url, alias='db1')
vehicle_types = Vehicletype.objects
vehicle_types_length = len(vehicle_types)

location_list = Location.objects
location_list_length = len(location_list)

with open('./data/car.json') as f:
    car_data = json.load(f)
    car_records = []
    for i in range(0, args.num_cars):
        rand_vehicle_type_idx = random.randint(0,vehicle_types_length-1)
        rand_location = random.randint(0,location_list_length-1)
        car_model = Vehicle(
            vehicle_type = vehicle_types[rand_vehicle_type_idx], # need to figure out how to generate type later
            default_hourly_rate = round(car_data[i]['rate']['daily'] / 24, 2),
            make=car_data[i]['vehicle']['make'],
            model=car_data[i]['vehicle']['model'],
            year=car_data[i]['vehicle']['year'],
            registration_tag = fake.license_plate(),
            current_mileage=car_data[i]['distance'],
            condition = random.choice(car_condition_choices), # need to figure out how to generate type later
            capacity = random.choice([2, 3, 4, 5, 6, 7, 8, 9, 10]), # need to figure out how to generate type later
            location = location_list[rand_location],
            is_active=True,
            is_available=True,
            reservation=[],
            images=map(get_original_image, car_data[i]['images'])
        )
        car_records.append(car_model)
    
    Vehicle.objects.insert(car_records)
    pprint("%d car records has been inserted into db" % (len(car_records)))
disconnect(alias='db1')