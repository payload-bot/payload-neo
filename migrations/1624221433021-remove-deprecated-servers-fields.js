"use strict";
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");

/*
  Removes the following from the ServerModel:
  * dashboard
  * settings
  
  These are not used in Payload anymore and should be deleted.
*/
module.exports.up = function (next) {
    config();

    MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
        .then(c => c.db())
        .then(db => db.collection("servers"))
        .then(collection =>
            Promise.all([
                collection,
                collection.updateMany(
                    {
                        dashboard: {
                            $exists: 1,
                        },
                    },
                    {
                        $unset: {
                            dashboard: 1,
                        },
                    }
                ),
            ])
        )
        .then(([collection]) =>
            collection.updateMany(
                {
                    settings: {
                        $exists: 1,
                    },
                },
                {
                    $unset: {
                        settings: 1,
                    },
                }
            )
        )
        .then(() => next());
};
