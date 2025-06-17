const express = require("express");
const db = require("./Utils/Database/dbConnect");
const bodyParser = require("body-parser");
const routes = require('./Routes/crud');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json())

app.use('/',routes);

app.listen(PORT, () => console.log("Server running on PORT:", PORT));
