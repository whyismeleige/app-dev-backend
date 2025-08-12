const controller = require("../controllers/server.controller");

module.exports = (app) => {
  app.post("/api/server/get-user", controller.getUser);
  app.post("/api/server/get-servers", controller.getServers);
  app.post("/api/server/get-user-details",controller.getDetails);
};
