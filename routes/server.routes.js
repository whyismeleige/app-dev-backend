const controller = require("../controllers/server.controller");
const http = require("http");
const { Server } = require("socket.io");

module.exports = (app) => {
  app.post("/api/server/get-user", controller.getUser);
  app.post("/api/server/get-servers", controller.getServers);
};
