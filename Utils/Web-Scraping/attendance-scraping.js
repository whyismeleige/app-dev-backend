const puppeteer = require('puppeteer');
const SERVER_URL = 'http://localhost:8080'

const getStudentsData = async () => {
    console.log('Scraping Data from College');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    })
    const ticket = 121423408006;
    const page = await browser.newPage();
    await page.goto('https://sjchyd.in/StudentLogin', {
        waitUntil: 'networkidle2'
    })
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.waitForSelector('input');
    await page.$eval(
        "input[type='text']",
        (el, value) => (el.value = value),
        ticket
    );
    await page.locator('#btnGo').click();
    await new Promise((r) => setTimeout(r, 2000));

    await page.locator('a').click();
    await page.waitForSelector('.caption');
    const studentData = await page.$$eval('.caption > p', (options) => {
        return options.map((option) =>
            option.textContent !== "Home" ? option.textContent.trim() : null
        )
    })
    console.log(studentData);
    await page.waitForSelector('#attendance-tab');
    await page.waitForFunction(() => {
        return typeof $ !== 'undefined' && typeof $.fn.tab === 'function';
    });

    await page.evaluate(() => {
        $('#attendance-tab').tab('show');
    })

    const tableData = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        const data = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 5) {
                data.push({
                    subject: cells[0].innerText.trim(),
                    workingDays: parseInt(cells[1].innerText.trim()) || 0,
                    daysPresent: parseInt(cells[2].innerText.trim()) || 0,
                    daysAbsent: parseInt(cells[3].innerText.trim()) || 0,
                    percentage: parseFloat(cells[4].innerText.trim()) || 0
                })
            }
        })
        return data;
    })
    console.log(tableData);
}

getStudentsData();