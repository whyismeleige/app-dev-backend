const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const dbConnect = require('./database/dbConnect');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json())

dbConnect();

require('./routes/auth.routes')(app);

app.listen(PORT, () => console.log("Server running on PORT:", PORT));

