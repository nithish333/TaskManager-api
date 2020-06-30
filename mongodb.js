const { MongoClient } = require("mongodb");
const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "newTaskManager";

MongoClient.connect(
  connectionUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error, client) => {
    if (error) {
      return console.log("Unable to connect to the database..");
    }
    const db = client.db(databaseName);
    console.log("Succesful");
  }
);
