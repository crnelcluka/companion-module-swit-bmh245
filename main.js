const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const { cgi } = require('./src/api')
const { parseQueryAll } = require('./src/constants')
const { getActions } = require('./src/actions')
const { getFeedbacks } = require('./src/feedbacks')
const { getVariableDefinitions } = require('./src/variables')
const { getPresets } = require('./src/presets')

class BMH245Instance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.pollTimer = null
		this.online = false
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
		this.setVariableDefinitions(getVariableDefinitions())
		this.setPresetDefinitions(getPresets())
		this.setVariableValues({ connected: 'false' })

		this.startPolling()
		// Kick an immediate poll so status/variables populate right away.
		this.pollStatus()
	}

	async destroy() {
		this.stopPolling()
	}

	async configUpdated(config) {
		this.config = config
		this.stopPolling()
		this.startPolling()
		this.pollStatus()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'SWIT BM-H245',
				value:
					'Controls the monitor over its built-in web interface (HTTP/CGI). ' +
					'Note: the monitor cannot be switched INTO Multiview over the network — ' +
					'that is a firmware limitation. The current source (including Multiview) is still reported.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Monitor IP address',
				width: 8,
				regex: Regex.IP,
				default: '10.0.0.59',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				width: 4,
				regex: Regex.PORT,
				default: '8080',
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Status poll interval (ms, 0 = off)',
				width: 6,
				default: 2000,
				min: 0,
				max: 60000,
			},
			{
				type: 'number',
				id: 'timeout',
				label: 'Request timeout (ms)',
				width: 6,
				default: 4000,
				min: 500,
				max: 20000,
			},
		]
	}

	// ---- control ----
	// Send one set-command. Returns the response text, or throws on transport error.
	async send(cmd, param) {
		if (!cmd) return
		const host = this.config.host
		const port = this.config.port || 8080
		try {
			const resp = await cgi(host, port, cmd, param, this.config.timeout)
			this.log('debug', `${cmd} param=${param} -> ${resp}`)
			this.setOnline(true)
			return resp
		} catch (err) {
			this.log('error', `${cmd} failed: ${err.message}`)
			this.setOnline(false)
			throw err
		}
	}

	// ---- status polling ----
	startPolling() {
		const interval = this.config.pollInterval
		if (!interval || interval <= 0) return
		this.pollTimer = setInterval(() => this.pollStatus(), interval)
	}

	stopPolling() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
	}

	async pollStatus() {
		const host = this.config.host
		const port = this.config.port || 8080
		if (!host) return
		try {
			const text = await cgi(host, port, 'CmdQueryAll', '', this.config.timeout)
			const parsed = parseQueryAll(text)
			if (!parsed) {
				this.log('warn', `Unexpected CmdQueryAll reply: ${text}`)
				this.setOnline(false)
				return
			}
			parsed.connected = 'true'
			this.setVariableValues(parsed)
			this.setOnline(true)
			this.checkFeedbacks(
				'input_source',
				'is_multiview',
				'freeze_active',
				'low_latency_on',
				'no_signal',
				'unreachable'
			)
		} catch (err) {
			this.setOnline(false)
			this.setVariableValues({ connected: 'false' })
			this.checkFeedbacks('unreachable', 'no_signal')
		}
	}

	setOnline(ok) {
		if (ok === this.online) return
		this.online = ok
		this.updateStatus(ok ? InstanceStatus.Ok : InstanceStatus.ConnectionFailure)
	}
}

runEntrypoint(BMH245Instance, [])
