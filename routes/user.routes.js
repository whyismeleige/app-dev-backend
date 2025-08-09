const controller = require('../controllers/user.controller');

module.exports = (app) => {
    app.post('/api/users/get-semesters',controller.getSemesters);
    app.post('/api/users/get-attendance',controller.getAttendanceData);
    app.get('/api/holidays',controller.getHolidays);
}