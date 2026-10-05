const {
	INPUT_SOURCES,
	FUNCTION_KEYS,
	FREEZE_MODES,
	ODD_EVEN_MODES,
	LOW_LATENCY_MODES,
	VIDEO_LEVEL_RANGES,
	YUV_MATRICES,
	GAMMAS,
	COLOR_TEMPS,
	LOG_MODES,
} = require('./constants')

// Build the action definitions. `self` is the module instance (provides
// self.send(cmd, param) and self.getVariableValue()).
function getActions(self) {
	const dropdown = (id, label, choices, def) => ({
		type: 'dropdown',
		id,
		label,
		choices,
		default: def ?? choices[0].id,
	})

	return {
		set_input_source: {
			name: 'Input: set source',
			options: [dropdown('source', 'Source', INPUT_SOURCES)],
			callback: async (ev) => self.send('CmdSetInputSource', ev.options.source),
		},

		function_key: {
			name: 'Press function key (F1-F5)',
			options: [dropdown('key', 'Key', FUNCTION_KEYS)],
			callback: async (ev) => self.send('CmdSetFunctionKey', ev.options.key),
		},

		load_profile: {
			name: 'Load user profile (1-4)',
			options: [
				{
					type: 'number',
					id: 'profile',
					label: 'Profile number',
					default: 1,
					min: 1,
					max: 4,
					range: false,
				},
			],
			callback: async (ev) => self.send('CmdSetLoadedProfile', ev.options.profile),
		},

		// ---- picture ----
		set_volume: {
			name: 'Picture: set volume (0-100)',
			options: [numOpt('value', 'Volume', 50, 0, 100)],
			callback: async (ev) => self.send('CmdSetVolume', clamp(ev.options.value, 0, 100)),
		},
		adjust_volume: {
			name: 'Picture: adjust volume (relative)',
			options: [numOpt('delta', 'Change by', 5, -100, 100)],
			callback: async (ev) => {
				const cur = toInt(self.getVariableValue('volume'), 50)
				await self.send('CmdSetVolume', clamp(cur + toInt(ev.options.delta, 0), 0, 100))
			},
		},
		set_chroma: {
			name: 'Picture: set chroma/saturation (-100..100)',
			options: [numOpt('value', 'Chroma', 0, -100, 100)],
			callback: async (ev) => self.send('CmdSetChroma', clamp(ev.options.value, -100, 100)),
		},
		set_bright: {
			name: 'Picture: set brightness (-100..100)',
			options: [numOpt('value', 'Brightness', 0, -100, 100)],
			callback: async (ev) => self.send('CmdSetBright', clamp(ev.options.value, -100, 100)),
		},
		set_contrast: {
			name: 'Picture: set contrast (-100..100)',
			options: [numOpt('value', 'Contrast', 0, -100, 100)],
			callback: async (ev) => self.send('CmdSetContrast', clamp(ev.options.value, -100, 100)),
		},

		// ---- modes ----
		set_freeze: {
			name: 'Freeze frame',
			options: [dropdown('mode', 'Mode', FREEZE_MODES, 'OFF')],
			callback: async (ev) => self.send('CmdSetFreezeFrame', ev.options.mode),
		},
		toggle_freeze: {
			name: 'Freeze frame: toggle (Full / Off)',
			options: [],
			callback: async () => {
				const cur = String(self.getVariableValue('freeze_frame') || 'OFF')
				await self.send('CmdSetFreezeFrame', cur === 'OFF' ? 'Full' : 'OFF')
			},
		},
		set_odd_even: {
			name: 'Odd/Even field freeze (interlaced only)',
			options: [dropdown('mode', 'Mode', ODD_EVEN_MODES, 'OFF')],
			callback: async (ev) => self.send('CmdSetOddEvenFrame', ev.options.mode),
		},
		set_low_latency: {
			name: 'Low latency mode',
			options: [dropdown('mode', 'Mode', LOW_LATENCY_MODES, 'OFF')],
			callback: async (ev) => self.send('CmdSetLowLatencyMode', ev.options.mode),
		},
		toggle_low_latency: {
			name: 'Low latency: toggle',
			options: [],
			callback: async () => {
				const cur = String(self.getVariableValue('low_latency') || 'OFF')
				await self.send('CmdSetLowLatencyMode', cur === 'ON' ? 'OFF' : 'ON')
			},
		},

		// ---- color ----
		set_video_level_range: {
			name: 'Color: video level range',
			options: [dropdown('value', 'Range', VIDEO_LEVEL_RANGES)],
			callback: async (ev) => self.send('CmdSetVideoLevelRange', ev.options.value),
		},
		set_yuv_matrix: {
			name: 'Color: YUV color matrix',
			options: [dropdown('value', 'Matrix', YUV_MATRICES)],
			callback: async (ev) => self.send('CmdSetYUVColorMatrixMode', ev.options.value),
		},
		set_gamma: {
			name: 'Color: gamma / EOTF',
			options: [dropdown('value', 'Gamma', GAMMAS, '2.2')],
			callback: async (ev) => self.send('CmdSetGamma', ev.options.value),
		},
		set_color_temp: {
			name: 'Color: color temperature',
			options: [dropdown('value', 'Color temp', COLOR_TEMPS, 'D65')],
			callback: async (ev) => self.send('CmdSetColorTemp', ev.options.value),
		},
		set_log_mode: {
			name: 'Color: camera log mode',
			options: [dropdown('value', 'Log mode', LOG_MODES, 'OFF')],
			callback: async (ev) => self.send('CmdSetLogMode', ev.options.value),
		},

		// ---- utility ----
		refresh_status: {
			name: 'Refresh status now',
			options: [],
			callback: async () => self.pollStatus(),
		},
		raw_command: {
			name: 'Advanced: send raw CGI command',
			options: [
				{ type: 'textinput', id: 'cmd', label: 'cmd (e.g. CmdSetInputSource)', default: '' },
				{ type: 'textinput', id: 'param', label: 'param (e.g. SDI1)', default: '' },
			],
			callback: async (ev) => self.send(ev.options.cmd, ev.options.param),
		},
	}
}

function numOpt(id, label, def, min, max) {
	return { type: 'number', id, label, default: def, min, max, range: true }
}
function clamp(v, lo, hi) {
	v = toInt(v, lo)
	return Math.max(lo, Math.min(hi, v))
}
function toInt(v, fallback) {
	const n = parseInt(v, 10)
	return Number.isFinite(n) ? n : fallback
}

module.exports = { getActions }
