const puppeteer = require("puppeteer");
// const getPDF = require("./downloadPDFs");
const SERVER_URL = "http://localhost:8080";
const ticket_ranges = require("../../hallticketsRanges");
const fs = require("fs-extra");
const https = require("https");
// const extractText = require('./pdfExtract');

const getCourseWork = async () => {
  console.log("Scraping the Website");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://josephscollege.ac.in/academics/under-graduate-courses/b-com-general/",
    {
      waitUntil: "networkidle2",
    }
  );
  page.setDefaultNavigationTimeout(2 * 60 * 1000);
  const selector = "#menu-under-graduate-courses";
  await page.waitForSelector(selector);
  const coursesList = await page.$$(`${selector} li a`);
  const coursesData = [];
  for (let i = 0; i < coursesList.length; i++) {
    const courses = await page.$$(`${selector} li a`);
    const text = await courses[i].evaluate((el) => el.innerText);
    coursesData.push(text);
    await Promise.all([
      courses[i].click(),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.waitForSelector(`.accordion`);
    const pdfLinks = await page.$$eval(
      '.accordion .answer a[href$=".pdf"]',
      (anchors) => anchors.map((a) => a.href)
    );
    await getPDF(text, pdfLinks);
  }
  await browser.close();
};

const getStudentsData = async () => {
  console.log("Scraping Data from College");
  const browser = await puppeteer.launch({
    headless: true,
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
      'input[type="text"]',
      (el, value) => (el.value = value),
      ticket
    );
    await page.locator("#btnGo").click();
    await new Promise((r) => setTimeout(r, 2000));
    if (page.url() === "https://sjchyd.in/StudentLogin/StudentLandingPage") {
      await page.locator("a").click();
      await page.waitForSelector(".caption");
      const data = await page.$$eval(".caption > p", (options) => {
        return options.map((option) =>
          option.textContent !== "Home" ? option.textContent.trim() : null
        );
      });
      await saveData(data);
    }
    
  }
  await browser.close();
};

const saveData = async (data) => {
  data = data.filter((element) => element !== null);
  const courseDetails = data[2].split(/[/]/);
  const deptDetails = courseDetails[1].split(/[-]/);
  const userData = {
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
  console.log(userData);
  await fetch(`${SERVER_URL}/student`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

const getExternalMarks = async () => {
  console.log(`Scraping data from college`);
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(2 * 60 * 1000);
  await page.goto("https://sjchyd.in/StudentLogin", {
    waitUntil: "networkidle2",
  });

  for (let ticket of ticket_ranges) {
    await page.waitForSelector("input");
    await page.$eval(
      'input[type="text"]',
      (el, value) => (el.value = value),
      ticket
    );
    await page.click("#btnGo");
    await new Promise((r) => setTimeout(r, 2000));

    if (page.url() === "https://sjchyd.in/StudentLogin/StudentLandingPage") {
      await page.locator("a").click();
      await page.waitForSelector("a");
      const linkHandle = await page.$(
        'a[href="/StudentLogin/CumulativeGradeReport"]'
      );

      await page.waitForSelector(".caption");
      let courseData = await page.$$eval(".caption > p", (options) => {
        return options.map((option) => option.textContent);
      });
      courseData = courseData.filter(data => data.includes('R22'));
      
      const pdfUrl = await page.evaluate((a) => a.href, linkHandle);
      const cookies = await page.browserContext().cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
      const url = new URL(pdfUrl);

      const options = {
        hostname: url.hostname,
        path: url.pathname,
        headers: { Cookie: cookieString },
      };

      const filePath = `${ticket} CumulativeGradeReport.pdf`;
      const file = fs.createWriteStream(filePath);
      const client = url.protocol === "https:" ? https : require("http");

      await new Promise((resolve, reject) => {
        client
          .get(options, (res) => {
            res.pipe(file);
            file.on("finish", async () => {
              file.close();
              console.log(`Downloaded: ${filePath}`);
              try {
                await extractText(filePath,courseData[0]);
                resolve();
              } catch (err) {
                console.error("Move error:", err);
                reject(err);
              }
            });
          })
          .on("error", reject);
      });
      fs.unlinkSync(filePath);
    }
    await page.goto("https://sjchyd.in/StudentLogin", {
      waitUntil: "networkidle2",
    });
  }
  await browser.close();
};

getStudentsData();

module.exports = getCourseWork;
