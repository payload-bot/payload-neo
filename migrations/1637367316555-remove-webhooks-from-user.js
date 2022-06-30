"use strict";
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");

/*
  Removes "webhook" field from users, as they're redudent
*/
module.exports.up = function (next) {
  config();

  MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
    .then(c => c.db())
    .then(db => db.collection("users"))
    .then(collection =>
      collection.updateMany(
        {
          webhook: {
            $exists: 1,
          },
        },
        {
          $unset: {
            webhook: 1,
          },
        }
      )
    )
    .then(() => next());
};
