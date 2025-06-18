const express = require("express");
const db = require("./Utils/Database/dbConnect");
const bodyParser = require("body-parser");
const routes = require('./Routes/crud');
const auth = require('./Routes/auth');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json())
app.use('/',auth);
app.use('/',routes);

app.listen(PORT, () => console.log("Server running on PORT:", PORT));

