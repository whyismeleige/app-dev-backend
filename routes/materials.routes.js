const controller = require('../controllers/materials.controller');

module.exports = (app) => {
    app.post('/api/materials',controller.getMaterials);
    app.post('/api/get-files',controller.getFile);
}