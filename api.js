const chromium = require('./chromium');

module.exports = async function (req, res) {
	try {
        if (!req.query.username || !req.query.password) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>Bad Request</h1><p>Missing username or password.</p>`);
        } else {
			const file = await chromium.myloans(req.query.username, req.query.password);
            res.statusCode = 200;
            res.end(file);
        }
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
        console.error(e.message);
    }
};