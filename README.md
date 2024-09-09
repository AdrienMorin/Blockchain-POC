# Blockchain-POC
A Bitcoin Proof Of Concept made with AdonisJS framework. It implements the bitcoin structure, simplified and centralized, to be simpler.

Video presentation of the project : https://youtu.be/19DjOkj8JXI

## Features
- [x] Login / Logout to a wallet
- [x] Get the wallet balance
- [x] Get the wallet public and private keys (using your login)
- [x] Get the blockchain (all the blocks with there transactions)
- [x] Create a transaction
- [x] Mine a block (include the created transactions into a block and add it to the blockchain)
- [x] Verify the blockchain (check if the blockchain is valid)

## Project structure
This API is structured in the following way: 
- `start/routes`: Contains the routes of the API
- `app/Controllers/Http`: Contains the controllers of the API called by the routes
- `app/Services`: Contains the services of the API called by the Controllers.
- `app/Models`: Contains the models of the API : User (the wallet), Block, BlockHeader, Transaction, Coin
- `database/migrations`: Contains the migrations of the API to create the structure of the database
- `database/seeds`: Contains the seeds of the API to put the first data in the database : Genesis block and first block
- `config`: Contains the configuration files of the API : config of the database connection for example

## Specificities
The blockchain is stored in a sqlite DB, in the `tmp/db.sqlite3` folder.

In this version of the API, there is no possibility to create a new wallet. The only wallets are those which are created by the seeders.
Those are the users credentials that you can use to login to the API :
```json
[{
"firstname": "Adrien",
"lastname": "Morin",
"email": "amorin@gmail.com",
"password": "amorin123"
},
{
"firstname": "Jean",
"lastname": "Dupont",
"email": "jdupont@gmail.com",
"password": "jdupont123"
},
{
"firstname": "Lucie",
"lastname": "Deschamps",
"email": "ldeschamps@gmail.com",
"password": "ldeschamps123"
},
{
"firstname": "Baptiste",
"lastname": "Durand",
"email": "bdurand@gmail.com",
"password": "bdurand123"
}]
```

## API requests examples

### Login
<o>`POST http://127.0.0.1:3333/api/auth/login`</o>
```json
{
    "email": "amorin@gmail.com",
    "password": "amorin123"
}
```

### Logout
`POST http://127.0.0.1:3333/api/auth/logout`

### GetIsLoggedIn
`GET http://127.0.0.1:3333/api/`
Authorization : Bearer <token>

### GetWallet
`GET http://127.0.0.1:3333/api/wallet/getWallet`
Authorization : Bearer <token>

### GetWalletBalance
`GET http://127.0.0.1:3333/api/wallet/getWalletBalance`
Authorization : Bearer <token>

### GetBlockchain
`GET http://127.0.0.1:3333/api/blockchain/`
Authorization : Bearer <token>

### CreateTransaction
Creates a transaction from the wallet of the connected account (related to the bearer token passed in the request) to another wallet
`POST http://127.0.0.1:3333/api/transactions/`
Authorization : Bearer <token>
```json
{
  "receiverKey": "-----BEGIN PUBLIC KEY-----.....-----END PUBLIC KEY-----\n",
  "amount": 3
}
```

### VerifyTransactionSignature
`POST http://127.0.0.1:3333/api/transactions/verify`
Authorization : Bearer <token>
```json
{
  "transactionId": 6
}
```

### MineBlock
Mine a block to add the created transactions into the blockchain. The minor is the connected account (related to the bearer token passed in the request).
`GET http://127.0.0.1:3333/api/blocks/mine`
Authorization : Bearer <token>

### VerifyBlockchain
`GET http://127.0.0.1:3333/api/verify`
Authorization : Bearer <token>

## Setup and run the project

### Using Docker

1. Clone the project
2. Run `docker compose up`

### Running the project locally

1. Clone the project
2. Create a `.env` file at the root of the project with the following content :
```
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=5ZiLQYPgJKzNJIhy2OgjtZ_4Puj7gwgW
DRIVE_DISK=local

DB_CONNECTION=sqlite
```
2. Install the dependencies with `pnpm install`
3. Run the migrations with `node ace migration:run`
4. Run the seeders with `node ace db:seed`
5. Start the server with `node ace serve --watch` or `pmpn run dev`
