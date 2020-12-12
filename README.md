# Team: Team 404/2

## Demos:
  (Requires an SJSU email in order to access)
  - [Customer Use Case Demo](https://drive.google.com/file/d/1CMTmwXb9jnZ9Jq5pVePzkTYAoC_TO4x0/view?usp=sharing)
  - [User Account and Admin functionality part I](https://drive.google.com/file/d/1pD8eqTaMm69a0asqDw7caci6SWjDbLcO/view?usp=sharing)
  - [Admin functionality Part II](https://drive.google.com/file/d/1UH8gqi3uG63jDIIrEeLsdvf_MYZu5xfO/view?usp=sharing)
  - [Auto Scaling](https://drive.google.com/file/d/1GkoK_rHwkBRWsQUhpSxHUK0BP87gDpOG/view?usp=sharing)

## Presentation Slide:
  - [Presentation Slide](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/CMPE-202-presentation.pptx)

## Team Members: 
    Shengtao Li (7seven7lst): car reservation, login and authentication, function of admin, AWS
    Kuang Sheng (cookiebaker444):  location and Map function, user profile, function of admin
    Yanlin Song (YS-RF): car search, price strategy design and implementation, function of admin
    Xuejun Yao (Roger-Yao8126): process the booking and generate contract, pay the bill, function of admin

## XP Values:
  - Communication: Weekly group meeting, share progress, ask for help
  - Feedback: Backend frontend corporation
  - Simplicity: Remove redundancy, focusing on requirement 
  - Respect: Show opinion proper way
  - Courage: When facing challenge, help each other

  [Detailed XP Values](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/XP_Value.md)

## Project Description:
  This project is a full stack car rental web application following the CMPE-202 group project requirement. This web application provide all the service that a car rental company can provide, and has no age limitation.
  
  [Project Requirement Doc](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/Rent.pdf)

## Project Feature Set:
  [List of Project features](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/features_of_web.docx)


## Project Journal:
 [Project Journal](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/tree/master/journal)


## Project Sprint Task Sheet:
[Project Sprint Task Sheet](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/tree/master/docs/sprint_task_sheet.xlsx)


## Project Architecture and Technical Stacks:

### Project Architecture
![Project Architecture](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/AWS_Deployment_Architecture.png)

### Tech Stack:

Backend:
- Database: Mongodb
- Document Mapper: MongoEngine
- Backend server: Flask,  ariadne graphql

Frontend:
- React, Redux
- HTML, CSS
- Ant Design, Bootstrap

Design:
- MockFlow Wireframe Pro

## UI Wireframe:
 [UI Design](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/Web_UI_design.pdf)


## Database Schema:
 ![Database Schema](https://github.com/gopinathsjsu/sp20-cmpe-202-sec-03-team-project-team-404-2/blob/master/docs/Detail_MongoDB_Schema.png)

## Local Development
### To start the backend server:
1. **cd** into `car_rental` direcotry.
2. under `car_rental` root directory, create a file named `.flaskenv` that has the content in `.flaskenv-example`, but put DB_URI as your actual DB_URI
3. `pipenv install` (optional)
4. `pipenv shell`
5. `python3 app.py`
6. now you can navigate to http://localhost:5000/graphql to query the backend

### To start the frontend server:
1. open a new terminal
2. install NodeJS version 10.13 or later: https://nodejs.org/en/blog/release/v10.13.0/
3. install Yarn: https://yarnpkg.com/lang/en/docs/install
4. **cd** into `car_rental` direcotry.
5. then, **cd** into `web_client` direcotry.
6. `yarn install`
7. `yarn start`
8. now you can navigate to http://localhost:3000 and it's the react front end

### To import car data into mongodb:
1. you should put the "car.json" file into `car_rental/data` directory.
2. **cd** into `car_rental` direcotry.
3. `pipenv install`
4. `pipenv shell`

To import car data into your local db:
* `python3 ingest-car-type.py --mongo_db=<your_db_name> --mongo_url="mongodb://localhost/<your_db_name>"`
* `python3 ingest-car.py --mongo_db=<your_db_name> --mongo_url="mongodb://localhost/<your_db_name>" --num_cars=100` 

To import location data into your local db:
* `python3 ingest-location.py --mongo_db=<your_db_name> --mongo_url="mongodb://localhost/<your_db_name>"`

To import car data into remote atlas db:
* `python3 ingest-car.py --mongo_db=<your_db_name> --mongo_url="<entire_atlas_db_url>" --num_cars=100` 

### Git workflow
#### Always create and checkout a new branch against master branch when you want to work on something
* `git checkout master`
* `git pull`
* `git checkout -b <your_branch_name>` 

#### Save changes often, and especially if you want to checkout some other branches, or merge changes in master branch into your branch
* `git add .`
* `git commit -m "<commit_message>"`
* `git checkout master`
* `git pull`
* `git checkout <your_branch_name>`
* `git merge master`

#### Helper method
* `@auth_required` decorator in resolver to indicate user must be logged in
* `@admin_required` decorator in resolver to indicate user must be admin in order to call this resolver
