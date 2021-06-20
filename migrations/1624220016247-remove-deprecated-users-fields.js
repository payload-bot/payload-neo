"use strict";
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");

/*
  Removes the following from the UserModel:
  * logsTfApiKey
  * servers
  
  These are not used in Payload anymore and should be deleted.
*/

module.exports.up = function (next) {
	config();

	MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
		.then(c => c.db())
		.then(db => db.collection("users"))
		.then(collection =>
			Promise.all([
				collection,
				collection.updateMany(
					{
						logsTfApiKey: {
							$exists: 1
						}
					},
					{
						$unset: {
							logsTfApiKey: 1
						}
					}
				)
			])
		)
		.then(([collection]) =>
			collection.updateMany(
				{
					servers: {
						$exists: 1
					}
				},
				{
					$unset: {
						servers: 1
					}
				}
			)
		)
		.then(() => next());
};
