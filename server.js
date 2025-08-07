const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const fetch = require('node-fetch');
const dbConnect = require('./database/dbConnect');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
dbConnect();

app.use(cors());
app.use(bodyParser.json())

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/materials.routes')(app);
require('./routes/server.routes')(app);

app.get('/api/holidays',async (req,res) => {
    try{
        const url = 'https://api.11holidays.com/v1/holidays?country=IN&year=2025';
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }catch(error){
        console.error('Error in fetching holidays data');
    }
})

app.listen(PORT, () => console.log("Server running on PORT:", PORT));

