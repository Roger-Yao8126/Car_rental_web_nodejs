# Team: Team 404/2

1. `build Mongodb schema for location, reservation, contract`

2. `implement graphQL query to add , get, delete, update the collection`

# More function to add

`Location class coordinator X, Y and may combine with Google API`

## start GraphQl

1. `pipenv shell`
2. `python3 app.py`

## create new booking

- `mutation { newBooking(vehicle_id:"5e66836ed654d5772d4eea59", booking_price:50, start_time: "2020-03-13 10:20:0", end_time: "2020-03-13 10:20:0"){ id, make } }`

## remove booking

- `mutation { delBooking(booking_id:"5e6bcccf3d376e6747c358d2"){ id } }`

## update booking

- `mutation { updateBooking(id:"5e6c7c2f0a745f05e6877b85", booking_price:20, start_time: "2020-03-9 10:20:0", end_time: "2020-03-10 10:20:0") { id } }`

## add location

- `mutation { addLocation(name:"SJSU", address:"San Jose", capacity: 100) { name } }`

## get location

- `query { location(id:"5e6d9ca8894d1a9cc1ea227b") { id, } }`

## update Location

- `mutation { updateLocation(id:"5e6db0889d8599220c1cc575" , name: "San Jose" , address:"Shanghai", capacity:200) { id } }`

## remove location

- `mutation { delLocation(location_id:"5e6daf939d8599220c1cc574"){ id } }`

## add contract

- `mutation { addContract(user_id: "Roger" , total_price: 50, actual_checkin_time: "2020-03-13 10:20:0", actual_return_time: "2020-03-13 10:20:0") { id } }`

## get contract

- `query { contract(id:"5e6ec07d623a71c7656614e1") { id, total_price } }`

## update contract

- `mutation { updateContract(id:"5e6eccedce3e8dedb20d377c" , user_id: "Roger" , total_price: 100, actual_checkin_time: "2020-03-1 10:20:0", actual_return_time: "2020-03-2 10:20:0") { id } }`

## remove contract

- `mutation { delContract(contract_id:"5e6ecc68d6a8053d8c4a2227"){ id } }`