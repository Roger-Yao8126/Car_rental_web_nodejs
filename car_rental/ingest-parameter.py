import argparse
import random
import json
from pprint import pprint
from mongoengine import connect, disconnect



from models import ParameterInfo

# 8 elements
parameter_description = ['below 5h', '6h to 10h', '11h to 24h', '24h to 72h','6 month membership fee','overdue fee']
# 8 numbers
parameter_number = [1, 0.95, 0.9, 0.8,100,50]

# script params
parser = argparse.ArgumentParser(description='Ingest all parameter')
parser.add_argument('--mongo_db', default='car_rent', help='mongodb db to connect to')
parser.add_argument('--mongo_url', default='mongodb://localhost/car_rent', help='mongodb url to connect to')
args = parser.parse_args()

connect(args.mongo_db, host=args.mongo_url, alias='db1')

parameter_pair = []
for x in range(6):
    one_pair = ParameterInfo(
        description = parameter_description[x],
        rate = parameter_number[x]
        )
    parameter_pair.append(one_pair)

ParameterInfo.objects.insert(parameter_pair)

disconnect(alias='db1')
