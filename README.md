# Cardboard Butler

Cardboard Butler is a webapp that let [BGG](https://boardgamegeek.com/) users show find a game from their collection that fit their game group.

Note, this is the early beta of Cardboard Butler verion 2, that is a reimplementation of version 1.
This project is still under contruction.

You can use the beta version here:

https://cardboardbutlerbeta.z21.web.core.windows.net/

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
npm start
```

The server will now be listening at:
[http://localhost:8080](http://localhost:8080)

## Testing

It is important to make sure all unit tests work when developing, and also to make new ones for your features.
To start testing run:

```bash
npm run test
```

## Building for production

To build run:

```bash
npm run build
```

This will create a production ready build in the dist folder.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

[![Build Status](https://travis-ci.org/PhilipK/CardboardButler.svg?branch=master)](https://travis-ci.org/PhilipK/CardboardButler)
