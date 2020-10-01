const chrome = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

async function newPage() {
	const browser = await puppeteer.launch({
		args: chrome.args,
		executablePath: await chrome.executablePath,
		headless: chrome.headless,
	})
	const page = await browser.newPage()
	await page.setRequestInterception(true)
	const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36'
	await page.setUserAgent(userAgent)
	page.on('request', (req) => {
		if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
			req.abort()
		} else {
			req.continue()
		}
	})
	return page
}

async function myloans(username, password) {
	const page = await newPage()
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

async function search(searchTerm) {
	const page = await newPage()
	await page.goto(`http://www.cbt.biblioteche.provincia.tn.it/oseegenius/search?q=${searchTerm.replace(' ', '+')}&s=25`)
	await page.waitForSelector('.results')
	const scrapedData = await page.evaluate(() =>
		Array.from(document.querySelectorAll('.item'))
			.map(x => ({
				title: x.querySelector('.title').innerText,
				edition: x.querySelector('.edition') ? x.querySelector('.edition').innerText : '',
				publisher: x.querySelector('.publisher').innerText,
				availability: x.querySelector('.availability').innerText
			})))
	return JSON.stringify(scrapedData)
}

module.exports = { myloans };