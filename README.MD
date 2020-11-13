
# Transaction Manager Simple App

A simple CRUD app back-end built in Nodejs + typescript for studying purposes

* Create transaction
* Delete transaction
* Import transactions file
* Get balance

## Technologies

* NodeJs 12
* Typescript
* Express
* Typeorm
* Postgresql
* Docker


## Installation Guide

1. Run "docker run --name [container_name] -e POSTGRES_PASSWORD=[password] -p 5434:5432 -d postgres" to deploy a postgresql docker container
2. Run "npm install" do install all the dependencies
3. Run "npx typeorm migration:run" to execute all the needed migrations
4. Run "npm run dev:server" to bootstrap the development server

## How to use

* Make a post request with the following payload on the route /transactions to create a new user:
```
{
  "title": "transactionTitle",
  "value": 9999,
  "type": "income/outcome",
  "category": "transactionCategory"
}
```

* Make a delete request on the route /transactions/{transactionId} to create a session:

* Make a post request with multipart structure on the route /transactions/import to import a transactions csv file

* Make a get request on the route /transactions to list the transactions and get the current balance
