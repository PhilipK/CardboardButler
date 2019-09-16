# Cardboard Butler

Cardboard Butler is a webapp that let [BGG](https://boardgamegeek.com/) users show find a game from their collection that fit their game group.

Note, this is the early beta of Cardboard Butler verion 2, that is a reimplementation of version 1.
This project is still under contruction.

You can use the beta version here:

https://cardboardbutlerbeta.z21.web.core.windows.net/

[![Build Status](https://dev.azure.com/philipkristoffersen/Cardboard%20Butler/_apis/build/status/PhilipK.CardboardButler?branchName=master)](https://dev.azure.com/philipkristoffersen/Cardboard%20Butler/_build/latest?definitionId=1&branchName=master)


## Installation

Make sure you have Node.js installed and can run npm.

To install run

```bash
npm install
```

or if you have yarn installed

```bash
yarn
```

## Developing

To start the development server

```bash
yarn start
```

The server will now be listening at:
[http://localhost:8080](http://localhost:8080)

## Testing

It is important to make sure all unit tests work when developing, and also to make new ones for your features.
To start testing run:

```bash
yarn test
```

## Building for production

To build run:

```bash
yarn build
```

This will create a production ready build in the dist folder.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

