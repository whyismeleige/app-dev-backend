const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dbConnect = require("./database/dbConnect");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
dbConnect();

const allowedOrigins = ["https://whyismeleige.github.io"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(bodyParser.json());

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/materials.routes")(app);
require("./routes/server.routes")(app);
require("./sockets")(io);

server.listen(PORT, () => console.log("Server running on PORT:", PORT));
