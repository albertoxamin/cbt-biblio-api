const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function myloans(username, password) {
	const browser = await puppeteer.launch({
		args: chrome.args,
		executablePath: await chrome.executablePath,
		headless: chrome.headless,
	});

	const page = await browser.newPage();
	await page.goto('http://www.cbt.biblioteche.provincia.tn.it/oseegenius/workspace?view=myloans')
	await page.type('input[name=j_username]', username)
	await page.type('input[name=j_password]', password)
	await page.click("input[value=Login]")
	await page.waitForSelector('.infoDataTable')
	const rows = (await page.$x('//table[@class="infoDataTable"]/tbody/tr'))
	let bookNo = 1
	let response = ''
	for (let i = 0; i < rows.length; i++) {
		const book = (await page.evaluate(el => {
			return el.textContent
		}, rows[i])).trim().replace(/\s\s/g, ';').replace(/;;/g, '').split(';')
		if (book.length === 1)
			response += `${book[0]}\n`
		else {
			response += `${bookNo}) `
			for (let j = 0; j < book.length; j++) {
				response += (((j === 0) ? '' : '\t') + book[j]) + '\n'
			}
			bookNo++
		}
	}
	return response
}

module.exports = { myloans };