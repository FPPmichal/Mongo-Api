const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config({path: "./config.env"});
const port = process.env.PORT || 3000;
const db = require("./db/conn");
const routes = require("./routes/record")

app.use(cors());
app.use(express.json());
app.use("", routes);


db.connectToDatabase();

app.listen(port, ()=> {
    console.log(`Server is running on ${port}`);
})
