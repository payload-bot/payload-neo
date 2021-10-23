"use strict";
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");

/*
  Removes all restrictions from all models, no more per-channel restrictions
*/
module.exports.up = function (next) {
  config();

  MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
    .then((c) => c.db())
    .then((db) => db.collection("servers"))
    .then((collection) =>
      collection.updateMany(
        {
          commandRestrictions: {
            $exists: 1,
          },
        },
        {
          $unset: {
            commandRestrictions: 1,
          },
        }
      )
    )
    .then(() => next());
};
