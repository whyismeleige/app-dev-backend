const express = require("express");
const router = express.Router();
const db = require("../Utils/Database/dbConnect");

router.post("/records", async (req, res, next) => {
  try {
    const { name, age } = req.body;
    const record = await db.none(
      "INSERT INTO records(name,age) VALUES($1,$2)",
      [name, age]
    );
    res.json({
      message: "Record created successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/records", async (req, res, next) => {
  try {
    const records = await db.any("SELECT * FROM records");
    res.json(records);
  } catch (error) {
    next(error);
  }
});

router.get("/student", async (req, res, next) => {
  try {
    const records = await db.any("SELECT * FROM students");
    res.json(records);
  } catch (error) {
    next(error);
  }
});

router.post("/student", async (req, res, next) => {
  try {
    const {
      id,
      name,
      year,
      course,
      dept,
      specialization,
      current_sem,
      email,
      phone_no,
    } = req.body;
    await db.one(
      `SELECT insert_student($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        id,
        name,
        year,
        course,
        dept,
        specialization,
        current_sem,
        email,
        phone_no,
      ]
    );
    console.log('User Created Successfully');
    res.status(201).json({
        message: "Record Created Successfully"
    })
  } catch (error) {
    console.error('Error Inserting User:',error.message);
    next(error);
  }
});

module.exports = router;
