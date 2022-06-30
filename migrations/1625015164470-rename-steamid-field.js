"use strict";
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");

/*
  Renames steamID to steamId in User model
*/
module.exports.up = function (next) {
  config();

  MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
    .then(c => c.db())
    .then(db => db.collection("users"))
    .then(collection =>
      collection.updateMany(
        {
          steamID: {
            $exists: 1,
          },
        },
        {
          $rename: {
            steamID: "steamId",
          },
        }
      )
    )
    .then(() => next());
};
