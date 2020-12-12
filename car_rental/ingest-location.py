import argparse
import random
import json
from pprint import pprint
from mongoengine import connect, disconnect
from datetime import datetime
from faker import Faker
from faker.providers import automotive

from models import Location

# init / consts
fake = Faker()
fake.add_provider(automotive)
#car_type_choices = ['small car', 'full-size car', 'truck', 'luxury car']
#car_condition_choices = ['new', 'like new', 'acceptable', 'need maintenance']

# script params

parser = argparse.ArgumentParser(description='Ingest location data from location data file.')
parser.add_argument('--mongo_db', default='car_rent', help='mongodb db to connect to')
parser.add_argument('--mongo_url', default='mongodb://localhost/car_rent', help='mongodb url to connect to')
parser.add_argument('--data_file', default='./data/location.json', help='location json data file to import')
parser.add_argument('--num_locations', type=int, default=50, help='number of locations to import')
args = parser.parse_args()

#
def get_original_image(car_record):
    return car_record['originalImageUrl']

connect(args.mongo_db, host=args.mongo_url, alias='db1')
#

with open(args.data_file) as f:
    location_data = json.load(f)
    #print(type(location_data))
    print(len(location_data['location']))
    location_records = []
    for i in range (0, len(location_data['location'])):
        loc = Location(
            name = location_data['location'][i]['name'],
            address = location_data['location'][i]['address'],
            capacity = location_data['location'][i]['capacity'],
            geo = [float(location_data['location'][i]['geo'][0]),float(location_data['location'][i]['geo'][1])]
        )
        location_records.append(loc)
    #print(location_records)
    Location.objects.insert(location_records)
    pprint("%d location records has been inserted into db" % (len(location_records)))
disconnect(alias='db1')