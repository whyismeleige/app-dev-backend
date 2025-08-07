const puppeteer = require("puppeteer");
const dbConnect = require("../../database/dbConnect");
const ticket_ranges = require("../Hall-Tickets/hallticketsRanges");
const db = require("../../models");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

dbConnect();

const Attendance = db.attendance;
const User = db.user;
const Student = db.student;

const getStudentsData = async () => {
  console.log("Scraping Data from College");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://sjchyd.in/StudentLogin", {
    waitUntil: "networkidle2",
  });
  page.setDefaultNavigationTimeout(2 * 60 * 1000);
  for (let ticket of ticket_ranges) {
    await page.waitForSelector("input");
    await page.$eval(
      "input[type='text']",
      (el, value) => (el.value = value),
      String(ticket)
    );
    await page.locator("#btnGo").click();
    await new Promise((r) => setTimeout(r, 2000));

    if (page.url() === "https://sjchyd.in/StudentLogin/StudentLandingPage") {
      await page.locator("a").click();
      await page.waitForSelector(".caption");
      const studentData = await page.$$eval(".caption > p", (options) => {
        return options.map((option) =>
          option.textContent !== "Home" ? option.textContent.trim() : null
        );
      });

      console.log(studentData);

      await page.waitForSelector("#attendance-tab");
      await page.waitForFunction(() => {
        return typeof $ !== "undefined" && typeof $.fn.tab === "function";
      });

      await saveData(studentData);

      await page.evaluate(() => {
        $("#attendance-tab").tab("show");
      });

      const tableData = await page.evaluate(() => {
        const rows = document.querySelectorAll("table tbody tr");
        const data = [];
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 5) {
            data.push({
              subject: cells[0].innerText.trim(),
              workingDays: parseInt(cells[1].innerText.trim()) || 0,
              daysPresent: parseInt(cells[2].innerText.trim()) || 0,
              daysAbsent: parseInt(cells[3].innerText.trim()) || 0,
              percentage: parseFloat(cells[4].innerText.trim()) || 0,
            });
          }
        });
        return data;
      });

      const user = new Attendance({
        id: ticket,
        data: tableData,
      });

      user
        .save()
        .then(() => console.log("Ticket Saved", ticket))
        .catch((error) => console.error("Error", error));
    }
    await page.goto("https://sjchyd.in/StudentLogin", {
      waitUntil: "networkidle2",
    });
  }
  await browser.close();
};

const saveData = async (data) => {
  data = data.filter((element) => element !== null);

  const courseDetails = data[2].split(/[/]/);
  const deptDetails = courseDetails[1].split(/[-]/);

  const studentData = {
    id: parseInt(data[0], 10),
    name: data[1],
    year: courseDetails[0],
    course: courseDetails[1],
    dept: deptDetails[0].trim(),
    specialization: deptDetails[1].trim(),
    current_sem: courseDetails[2],
    email: `${data[0]}@josephscollege.ac.in`,
    phone_no: parseInt(data[3], 10),
  };

  const year = `20${courseDetails[0].substr(1)}`;

  const userData = {
    email: `${data[0]}@josephscollege.ac.in`,
    password: `Josephs@${year}`,
  };

  const newUser = new User(userData);
  const newStudent = new Student(studentData);

  bcrypt.hash(newUser.password, 10).then((hashedPassword) => {
    newUser.password = hashedPassword;

    newStudent.save().then(() => console.log("Student Saved"));
    newUser.save().then(() => console.log("User Saved"));
  });
};

getStudentsData();
