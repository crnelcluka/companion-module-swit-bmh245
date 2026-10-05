// Control protocol for the SWIT BM-H245, reverse-engineered from the monitor's
// own web UI (index.html / api.js) and the display firmware (4k_osd.elf).
//
// Every control is one HTTP GET:
//   http://<ip>:<port>/cgi-bin/getinfo.cgi?cmd=<Cmd>&param=<value>&k=<ms>
// `k` is a cache-buster (milliseconds). The CGI parses the query with a plain
// sscanf("%[^&]&%[^&]&%[^&]") and does NOT url-decode, so params are sent raw.
// Every listed param value below is ASCII and URL-safe (no spaces), matching
// exactly what the web UI puts on the wire — the web buttons send their `value`
// attribute, not their element id (e.g. freeze sends "Full"/"OFF", not
// "FreezeFrameFull").

// ---- settable input sources -------------------------------------------------
// NOTE: "Multiview" is intentionally NOT here. The firmware reports Multiview as
// the current source (see CmdQueryAll) but REJECTS it as a CmdSetInputSource
// value — verified on hardware: the command returns "ok" but the source does not
// change. Multiview can only be entered from the monitor's local menu. The
// module still DISPLAYS Multiview via the $(bmh245:input_source) variable.
//
// `id` is the exact value sent to the monitor (CmdSetInputSource param) and must
// not be changed. `btn` is the text shown on a preset button face (defaults to
// `id` when omitted). `label` is the long name used in action/feedback dropdowns.
// `status` lists the string(s) the monitor REPORTS for this source in
// CmdQueryAll, which for several sources differs from the command value (verified
// on hardware: SQ -> "4xSDI SQD", 2-SI -> "4xSDI 2SI", SFP -> "SFP1"). Feedback
// matching uses these, not `id`.
const INPUT_SOURCES = [
	{ id: 'SDI1', label: 'SDI 1' },
	{ id: 'SDI2', label: 'SDI 2' },
	{ id: 'SDI3', label: 'SDI 3' },
	{ id: 'SDI4', label: 'SDI 4' },
	{ id: 'SQ', btn: '4K SQD', label: '4K SQD (Square-division quad-link)', status: ['4xSDI SQD'] },
	{ id: '2-SI', btn: '4K 2SI', label: '4K 2SI (Two-sample interleave quad-link)', status: ['4xSDI 2SI'] },
	{ id: 'SFP', label: 'SFP', status: ['SFP1', 'SFP2'] },
	{ id: 'HDMI', label: 'HDMI', status: ['HDMI 2.0', 'HDMI2.0'] },
]

// True if the monitor's reported input-source string corresponds to the given
// source id. Compares (case-insensitively) against the id plus its `status`
// aliases, so it works despite the command/report string mismatch.
function inputSourceMatches(id, reported) {
	const norm = (s) => String(s == null ? '' : s).trim().toUpperCase()
	const src = INPUT_SOURCES.find((s) => s.id === id)
	const candidates = [id, ...((src && src.status) || [])].map(norm)
	return candidates.includes(norm(reported))
}

const FUNCTION_KEYS = [
	{ id: 'F1', label: 'F1' },
	{ id: 'F2', label: 'F2' },
	{ id: 'F3', label: 'F3' },
	{ id: 'F4', label: 'F4' },
	{ id: 'F5', label: 'F5' },
	{ id: 'F6', label: 'F6' },
]

const FREEZE_MODES = [
	{ id: 'OFF', label: 'Off' },
	{ id: 'Full', label: 'Full frame' },
	{ id: 'TopHalf', label: 'Top half' },
	{ id: 'BottomHalf', label: 'Bottom half' },
]

// Odd/Even field freeze — only accepted when the input format is interlaced.
const ODD_EVEN_MODES = [
	{ id: 'OFF', label: 'Off' },
	{ id: 'Odd', label: 'Odd field' },
	{ id: 'Even', label: 'Even field' },
]

const LOW_LATENCY_MODES = [
	{ id: 'ON', label: 'On' },
	{ id: 'OFF', label: 'Off' },
]

const VIDEO_LEVEL_RANGES = [
	{ id: '0-1023', label: 'Full 0-1023' },
	{ id: '4-1019', label: '4-1019' },
	{ id: '64-940', label: 'Limited 64-940' },
	{ id: '64-1023', label: '64-1023' },
]

const YUV_MATRICES = [
	{ id: 'Auto', label: 'Auto' },
	{ id: 'BT.601', label: 'BT.601' },
	{ id: 'BT.709', label: 'BT.709' },
	{ id: 'BT.2020', label: 'BT.2020' },
]

const GAMMAS = [
	{ id: '1.0', label: '1.0' },
	{ id: '1.8', label: '1.8' },
	{ id: '2.2', label: '2.2' },
	{ id: '2.4', label: '2.4' },
	{ id: '2.6', label: '2.6' },
	{ id: 'PQ1000', label: 'PQ 1000' },
	{ id: 'HLG1000', label: 'HLG 1000' },
	{ id: 'S-Log3', label: 'S-Log3' },
]

const COLOR_TEMPS = [
	{ id: '3200K', label: '3200K' },
	{ id: 'D55', label: 'D55' },
	{ id: '5600K', label: '5600K' },
	{ id: '6500K', label: '6500K' },
	{ id: 'D65', label: 'D65' },
	{ id: 'D75', label: 'D75' },
	{ id: '9300K', label: '9300K' },
	{ id: 'D93', label: 'D93' },
	{ id: 'USER1', label: 'User 1' },
	{ id: 'USER2', label: 'User 2' },
]

const LOG_MODES = [
	{ id: 'OFF', label: 'Off' },
	{ id: 'J-Log1', label: 'J-Log1' },
	{ id: 'Log-C', label: 'Log-C' },
	{ id: 'S-Log2', label: 'S-Log2' },
	{ id: 'C-Log', label: 'C-Log' },
	{ id: 'V-Log', label: 'V-Log' },
	{ id: 'RedLogFilm', label: 'RedLogFilm' },
	{ id: 'S-Log3', label: 'S-Log3' },
	{ id: 'User-Log', label: 'User-Log' },
]

// ---- CmdQueryAll response layout --------------------------------------------
// The status query returns a single pipe-separated line. Field order was taken
// from setTitleParam() in api.js (which skips raw field index 4 and offsets the
// rest) and confirmed against a live unit. 22 fields:
//
//   0  input_source        (can read "Multiview"; also SDIx / SQ / 2-SI / SFP / HDMI)
//   1  input_format        (e.g. "No Signal", "1080I59.94")
//   2  loaded_profile      (1-based index)
//   3  video_level_range
//   4  input_color_space   (not shown in the monitor's own status panel; exposed anyway)
//   5  yuv_color_matrix
//   6  volume              (0..100)
//   7  chroma              (-100..100)
//   8  bright              (-100..100)
//   9  contrast            (-100..100)
//   10 freeze_frame
//   11 odd_even_frame
//   12 low_latency
//   13 gamma
//   14 color_temp
//   15 log_mode
//   16 ip
//   17 netmask
//   18 gateway
//   19 port
//   20 version
//   21 model
const QUERY_FIELDS = [
	'input_source',
	'input_format',
	'loaded_profile',
	'video_level_range',
	'input_color_space',
	'yuv_color_matrix',
	'volume',
	'chroma',
	'bright',
	'contrast',
	'freeze_frame',
	'odd_even_frame',
	'low_latency',
	'gamma',
	'color_temp',
	'log_mode',
	'ip',
	'netmask',
	'gateway',
	'port',
	'version',
	'model',
]

// Parse the pipe-separated CmdQueryAll response into { variableId: value }.
// Returns null if the response doesn't look like a valid status line.
function parseQueryAll(text) {
	if (typeof text !== 'string') return null
	const parts = text.split('|')
	// A valid reply has at least through the model field. Be lenient on trailing.
	if (parts.length < QUERY_FIELDS.length) return null
	const out = {}
	for (let i = 0; i < QUERY_FIELDS.length; i++) {
		out[QUERY_FIELDS[i]] = (parts[i] ?? '').trim()
	}
	return out
}

module.exports = {
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
	QUERY_FIELDS,
	parseQueryAll,
	inputSourceMatches,
}
