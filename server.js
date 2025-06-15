const express = require("express");
const db = require("./Utils/Database/dbConnect");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.get('/',async (req,res) => {
  try{
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})

app.listen(PORT, () => console.log("Server running on PORT:", PORT));
