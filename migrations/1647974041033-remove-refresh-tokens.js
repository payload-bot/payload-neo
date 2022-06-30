"use strict";
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");

/*
  Removes "RefreshTokens" database
*/
module.exports.up = function (next) {
  config();

  MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
    .then(c => c.db())
    .then(db => db.collection("refreshtokens"))
    // No op on deletion - if it's deleted it's deleted. Don't care.
    .then(collection => collection.drop().catch(() => {}))
    .then(() => next());
};
