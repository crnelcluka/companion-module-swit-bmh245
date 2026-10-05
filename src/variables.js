// Variable definitions exposed to Companion. Values are populated by the status
// poll (CmdQueryAll) in main.js.
function getVariableDefinitions() {
	return [
		{ variableId: 'connected', name: 'Reachable (true/false)' },
		{ variableId: 'model', name: 'Model' },
		{ variableId: 'version', name: 'Firmware version' },

		{ variableId: 'input_source', name: 'Input source (may read "Multiview")' },
		{ variableId: 'input_format', name: 'Input format / signal' },
		{ variableId: 'loaded_profile', name: 'Loaded profile index' },

		{ variableId: 'volume', name: 'Volume' },
		{ variableId: 'chroma', name: 'Chroma' },
		{ variableId: 'bright', name: 'Brightness' },
		{ variableId: 'contrast', name: 'Contrast' },

		{ variableId: 'freeze_frame', name: 'Freeze frame state' },
		{ variableId: 'odd_even_frame', name: 'Odd/Even field freeze state' },
		{ variableId: 'low_latency', name: 'Low latency state' },

		{ variableId: 'video_level_range', name: 'Video level range' },
		{ variableId: 'input_color_space', name: 'Input color space' },
		{ variableId: 'yuv_color_matrix', name: 'YUV color matrix' },
		{ variableId: 'gamma', name: 'Gamma / EOTF' },
		{ variableId: 'color_temp', name: 'Color temperature' },
		{ variableId: 'log_mode', name: 'Camera log mode' },

		{ variableId: 'ip', name: 'Monitor IP' },
		{ variableId: 'netmask', name: 'Net mask' },
		{ variableId: 'gateway', name: 'Gateway' },
		{ variableId: 'port', name: 'Control port' },
	]
}

module.exports = { getVariableDefinitions }
