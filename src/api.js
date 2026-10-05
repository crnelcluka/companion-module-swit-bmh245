// Tiny HTTP client for the BM-H245 CGI. Uses Node's built-in http so the module
// has no runtime dependency beyond @companion-module/base.
const http = require('http')

// Perform one CGI call. Resolves with the trimmed response body (usually "ok"
// for sets, or a pipe-separated line for queries). Rejects on timeout/transport
// error. `param` is sent raw (the CGI does not url-decode); all protocol values
// in constants.js are URL-safe, so no encoding is applied.
function cgi(host, port, cmd, param, timeoutMs) {
	const p = param === undefined || param === null ? '' : String(param)
	const path = `/cgi-bin/getinfo.cgi?cmd=${cmd}&param=${p}&k=${Date.now()}`

	return new Promise((resolve, reject) => {
		// The BM-H245's embedded thttpd server emits slightly non-RFC-compliant
		// response headers that Node's strict parser rejects ("Invalid header
		// value char"). curl tolerates them; insecureHTTPParser makes Node do the
		// same. Safe here: this talks only to the monitor on the local network.
		const req = http.get({ host, port, path, timeout: timeoutMs || 4000, insecureHTTPParser: true }, (res) => {
			let body = ''
			res.setEncoding('utf8')
			res.on('data', (chunk) => (body += chunk))
			res.on('end', () => {
				if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
					resolve(body.trim())
				} else {
					reject(new Error(`HTTP ${res.statusCode}`))
				}
			})
		})
		req.on('timeout', () => req.destroy(new Error('Request timed out')))
		req.on('error', (err) => reject(err))
	})
}

module.exports = { cgi }
