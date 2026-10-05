const { combineRgb } = require('@companion-module/base')
const { INPUT_SOURCES, FREEZE_MODES, inputSourceMatches } = require('./constants')

function getFeedbacks(self) {
	const white = combineRgb(255, 255, 255)
	const green = combineRgb(0, 160, 0)
	const red = combineRgb(255, 0, 0)
	const amber = combineRgb(200, 120, 0)
	const blue = combineRgb(0, 80, 160)

	return {
		// Highlight a button when its source is the one currently selected.
		input_source: {
			type: 'boolean',
			name: 'Input source is selected',
			description: 'Active when the monitor is currently on the chosen source.',
			defaultStyle: { bgcolor: red, color: white },
			options: [
				{
					type: 'dropdown',
					id: 'source',
					label: 'Source',
					choices: INPUT_SOURCES,
					default: 'SDI1',
				},
			],
			callback: (fb) => inputSourceMatches(fb.options.source, self.getVariableValue('input_source')),
		},

		// Active whenever the monitor reports Multiview (can only be set locally).
		is_multiview: {
			type: 'boolean',
			name: 'Input source is Multiview',
			description: 'Active when the monitor is in Multiview (set from the local menu).',
			defaultStyle: { bgcolor: blue, color: white },
			options: [],
			callback: () => String(self.getVariableValue('input_source')) === 'Multiview',
		},

		freeze_active: {
			type: 'boolean',
			name: 'Freeze frame is active',
			description: 'Active when freeze frame is anything other than Off.',
			defaultStyle: { bgcolor: amber, color: white },
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Match mode (or Any)',
					choices: [{ id: 'ANY', label: 'Any (not Off)' }, ...FREEZE_MODES],
					default: 'ANY',
				},
			],
			callback: (fb) => {
				const cur = String(self.getVariableValue('freeze_frame') || 'OFF')
				if (fb.options.mode === 'ANY') return cur !== 'OFF'
				return cur === fb.options.mode
			},
		},

		low_latency_on: {
			type: 'boolean',
			name: 'Low latency is ON',
			defaultStyle: { bgcolor: green, color: white },
			options: [],
			callback: () => String(self.getVariableValue('low_latency')) === 'ON',
		},

		no_signal: {
			type: 'boolean',
			name: 'No input signal',
			description: 'Active when the input format reports no/invalid signal.',
			defaultStyle: { bgcolor: combineRgb(160, 0, 0), color: white },
			options: [],
			callback: () => {
				const f = String(self.getVariableValue('input_format') || '').toLowerCase()
				return f === '' || f.includes('no signal') || f.includes('no input')
			},
		},

		unreachable: {
			type: 'boolean',
			name: 'Monitor unreachable',
			defaultStyle: { bgcolor: combineRgb(90, 0, 0), color: white },
			options: [],
			callback: () => String(self.getVariableValue('connected')) !== 'true',
		},
	}
}

module.exports = { getFeedbacks }
