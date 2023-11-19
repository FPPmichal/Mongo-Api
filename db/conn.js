const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = process.env.URI;
const dbName = "products";

let db;

async function connectToDatabase() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

function getDatabase() {
    return db;
}

module.exports = {
    connectToDatabase,
    getDatabase,
};