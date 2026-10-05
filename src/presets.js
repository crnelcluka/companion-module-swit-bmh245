const { combineRgb } = require('@companion-module/base')
const { INPUT_SOURCES, FUNCTION_KEYS } = require('./constants')

// Ready-to-drop buttons. Source buttons self-highlight via the input_source
// feedback; the Multiview button is display-only (shows state, cannot set it).
function getPresets() {
	const black = combineRgb(0, 0, 0)
	const white = combineRgb(255, 255, 255)
	const darkGrey = combineRgb(40, 40, 40)
	const green = combineRgb(0, 160, 0)
	const red = combineRgb(255, 0, 0)
	const blue = combineRgb(0, 80, 160)

	const presets = {}

	// Input source buttons
	for (const src of INPUT_SOURCES) {
		presets[`src_${src.id}`] = {
			type: 'button',
			category: 'Input source',
			name: src.label,
			style: { text: src.btn || src.id, size: '18', color: white, bgcolor: darkGrey },
			steps: [{ down: [{ actionId: 'set_input_source', options: { source: src.id } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'input_source',
					options: { source: src.id },
					style: { bgcolor: red, color: white },
				},
			],
		}
	}

	// Multiview status (display only — firmware won't set it over the network)
	presets['src_multiview_status'] = {
		type: 'button',
		category: 'Input source',
		name: 'Multiview (status only)',
		style: { text: 'MULTI\\nVIEW', size: '14', color: white, bgcolor: black },
		steps: [{ down: [], up: [] }],
		feedbacks: [{ feedbackId: 'is_multiview', options: {}, style: { bgcolor: blue, color: white } }],
	}

	// Function keys
	for (const fk of FUNCTION_KEYS) {
		presets[`fkey_${fk.id}`] = {
			type: 'button',
			category: 'Function keys',
			name: fk.label,
			style: { text: fk.id, size: '18', color: white, bgcolor: darkGrey },
			steps: [{ down: [{ actionId: 'function_key', options: { key: fk.id } }], up: [] }],
			feedbacks: [],
		}
	}

	// Freeze toggle
	presets['freeze_toggle'] = {
		type: 'button',
		category: 'Modes',
		name: 'Freeze toggle',
		style: { text: 'FREEZE', size: '14', color: white, bgcolor: darkGrey },
		steps: [{ down: [{ actionId: 'toggle_freeze', options: {} }], up: [] }],
		feedbacks: [
			{ feedbackId: 'freeze_active', options: { mode: 'ANY' }, style: { bgcolor: combineRgb(200, 120, 0), color: white } },
		],
	}

	// Low latency toggle
	presets['lowlatency_toggle'] = {
		type: 'button',
		category: 'Modes',
		name: 'Low latency toggle',
		style: { text: 'LOW\\nLAT', size: '14', color: white, bgcolor: darkGrey },
		steps: [{ down: [{ actionId: 'toggle_low_latency', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'low_latency_on', options: {}, style: { bgcolor: green, color: white } }],
	}

	// Volume up / down
	presets['vol_up'] = {
		type: 'button',
		category: 'Picture',
		name: 'Volume +5',
		style: { text: 'VOL\\n+5', size: '14', color: white, bgcolor: darkGrey },
		steps: [{ down: [{ actionId: 'adjust_volume', options: { delta: 5 } }], up: [] }],
		feedbacks: [],
	}
	presets['vol_down'] = {
		type: 'button',
		category: 'Picture',
		name: 'Volume -5',
		style: { text: 'VOL\\n-5', size: '14', color: white, bgcolor: darkGrey },
		steps: [{ down: [{ actionId: 'adjust_volume', options: { delta: -5 } }], up: [] }],
		feedbacks: [],
	}

	// Status display
	presets['status_source'] = {
		type: 'button',
		category: 'Status',
		name: 'Current source + format',
		style: { text: '$(bmh245:input_source)\\n$(bmh245:input_format)', size: '14', color: white, bgcolor: black },
		steps: [{ down: [{ actionId: 'refresh_status', options: {} }], up: [] }],
		feedbacks: [
			{ feedbackId: 'no_signal', options: {}, style: { bgcolor: combineRgb(160, 0, 0), color: white } },
			{ feedbackId: 'unreachable', options: {}, style: { bgcolor: combineRgb(90, 0, 0), color: white } },
		],
	}

	return presets
}

module.exports = { getPresets }
