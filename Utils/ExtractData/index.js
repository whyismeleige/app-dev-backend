const puppeteer = require("puppeteer");
const id = "sandya";
const password = "sandya@123";
const db = require("../../models");
const dbConnect = require("../../database/dbConnect");

dbConnect();

const yearCodes = ["28", "32", "34"];
const years = ["R23", "R24", "R25"];
const programCodes = ["13", "14", "15", "16"];
const programs = ["B.SC", "B.A", "B.COM", "BBA"];

const getData = async () => {
  console.log("Scraping the Website");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto("https://sjchyd.in/Home/Login", {
    waitUntil: "networkidle2",
  });
  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  // Login into Website
  await page.waitForSelector(".Loginbtn");
  await page.locator(".Loginbtn").click();
  await page.waitForSelector("#UserName");
  await page.$eval("#UserName", (el, value) => (el.value = value), id);
  await page.$eval("#Password", (el, value) => (el.value = value), password);
  await page.locator('input[type="submit"]').click();

  // Choose Graduation
  await page.waitForSelector("#btnSelectGrad");
  await page.locator("#btnSelectGrad").click();
  await page.waitForSelector("#ddlGraduation");
  await page.select("#ddlGraduation", "1");
  await page.locator("#btnGradSubmit").click();

  // Go to Student Details Page
  await page.goto("https://sjchyd.in/Atttendance/AttendanceDetails", {
    waitUntil: "networkidle2",
  });

  await page.evaluate(() => {
    const input = document.querySelector("#FromDate");
    input.value = "01/07/2025";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  for (let i = 0; i < yearCodes.length; i++) {
    await page.select("#YearFKey", yearCodes[i]);
    for (let j = 0; j < programCodes.length; j++) {
      await page.select("#ProgrammeFKey", programCodes[j]);
      await new Promise((r) => setTimeout(r, 2000));

      const groupOptions = await page.$$("#GroupFKey option");
      const groupCodes = [];
      const groupTexts = [];

      for (let k = 1; k < groupOptions.length; k++) {
        const opt = groupOptions[k];
        const value = await opt.getProperty("value").then((p) => p.jsonValue());
        groupCodes.push(value);

        const rawText = await opt
          .getProperty("textContent")
          .then((p) => p.jsonValue());
        const cleaned = rawText.trim().replace(/-\d+$/, "").trim();
        groupTexts.push(cleaned);
      }

      for (let k = 0; k < groupCodes.length; k++) {
        await page.select("#GroupFKey", groupCodes[k]);
        await page.evaluate(() => {
          document
            .querySelector("#GroupFKey")
            .dispatchEvent(new Event("change", { bubbles: true }));
        });
        let prevFirstRow = null;

        const studentSemData = {};

        for (let sem = 1; sem <= 6; sem++) {
          const semesterText = `Semester ${sem}`;

          await page.evaluate((text) => {
            const select = document.querySelector("#SemesterFKey");
            const option = [...select.options].find(
              (opt) => opt.textContent.trim() === text
            );
            if (option) {
              select.value = option.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }, semesterText);

          await page.waitForSelector("#btnView", { visible: true });
          await page.evaluate(() => document.querySelector("#btnView").click());

          await page.waitForFunction(() => {
            const cell = document.querySelector(
              "#tblAttendanceDeta tbody tr td"
            );
            return cell && cell.textContent.trim().length > 0;
          });

          prevFirstRow = await page.evaluate(() => {
            const row = document.querySelector(
              "#tblAttendanceDeta tbody tr td:nth-child(3)"
            );
            return row ? row.textContent.trim() : null;
          });

          const isNoData = await page.evaluate(() => {
            const firstCell = document.querySelector(
              "#tblAttendanceDeta tbody tr td"
            );
            return (
              firstCell && firstCell.textContent.trim() === "No Data Available"
            );
          });

          if (isNoData) {
            console.log(
              `Semester ${sem} Subjects: [No Data Available — Skipping]`
            );
            break;
          }

          const subjectNames = await page.$$eval(
            "#tblAttendanceDeta tbody tr",
            (rows) => {
              return [
                ...new Set(
                  rows
                    .map((row) => {
                      const cells = row.querySelectorAll("td");
                      return cells[2]?.textContent.trim();
                    })
                    .filter(Boolean)
                ),
              ];
            }
          );

          studentSemData[semesterText] = subjectNames;

          console.log(`Semester ${sem} Subjects:`, subjectNames);
        }
        const newEntry = new db.subjects({
          course: `${programs[j]} ${groupTexts[k]}`,
          dept: programs[j],
          specialization: groupTexts[k],
          year: years[i],
          data: studentSemData
        });
        await newEntry.save();
      }
    }
  }
  //
  // const newEntry = new db.subjects({
  //   course: "BBA IT",
  //   dept: "BBA",
  //   specialization: "IT",
  //   year: "R23",
  //   data: studentSemData,
  // });
  // await newEntry.save();
  // console.log(studentSemData);
};

getData();
