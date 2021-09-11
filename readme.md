# How to run 

### the project has 3 branches:
1. master: contains Dockerized nodeJs App.
2. Mysql: contains dockerized mysql App.
3. compose: contains files needed to build and run the whole App.


### Instructions to run for the first time
- open terminal and create a folder anywhere using this command<br>
    ```mkdir Run;```<br>
- go inside that folder and clone the compose branch using these command:<br>
    ```cd Run;```<br>
    ```git clone --branch compose https://github.com/AmrHossam902/GQLTask.git compose;```
    - now you have compose directory inside Run containing compose branch
- go inside compose and run **run.sh** script<br>
```cd compose;```<br>
```bash run.sh;```

- now the containers are running, you can access the project at<br>
```https:localhost:5555/graphql```


### Run Containers again, after stopping them
- go in terminal inside compose folder and run
```docker-compose up```

### DbSchema
#### user

| id | name | email | password |
|--- | -----| ---   | ---      |
| int| string |string| string|


#### product
| id | name | price | userId |
|--- | -----| ---   | ---    |
| int| string |double| int|


### Mutations

all mutations are available through ***graphiql*** interface docs at ```https:localhost:5555/graphql```

1. register(name, email, password, confirmPassword)
    - adds new user in the DB.

2. addProduct(name, price)
    - adds a new product to db only of user is logged in.


### Queries
all queries are available through ***graphiql*** interface docs at ```https:localhost:5555/graphql```

1. login(email, password)
    - allow user to send login request.
    - sets an ***idedntification*** token if user credentials are correct
    
    
    
2. getUserProducts
    - fetches all products specific for the user who onws the session
    - works only if user is logged in

3. getAllProducts
    - get all products of all users
    - works only if user is logged in