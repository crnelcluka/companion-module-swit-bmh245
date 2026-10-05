# SWIT BM-H245

Control a **SWIT BM-H245** broadcast monitor over its built-in web interface
(HTTP/CGI). The monitor's control port is **8080** (not 80).

## Configuration

| Field | Example | Notes |
|---|---|---|
| Monitor IP address | `10.0.0.59` | The monitor's network address |
| Port | `8080` | BM-H245 web UI port |
| Status poll interval | `2000` ms | How often to read status (0 = off) |
| Request timeout | `4000` ms | Per-request timeout |

There is **no authentication** on the monitor's web interface — anyone on the
network can control it. Keep the monitor on a trusted/management network.

## Actions

- **Input: set source** — SDI1-4, SQ, 2-SI, SFP, HDMI
- **Press function key** — F1-F5
- **Load user profile** — 1-4
- **Picture** — volume (set / relative), chroma, brightness, contrast
- **Freeze frame** — Off / Full / Top half / Bottom half (+ toggle)
- **Odd/Even field freeze** — interlaced sources only
- **Low latency** — on / off / toggle
- **Color** — video level range, YUV matrix, gamma/EOTF, color temperature, log mode
- **Refresh status now**
- **Advanced: send raw CGI command**

## Variables

`$(bmh245:input_source)`, `input_format`, `loaded_profile`, `volume`, `chroma`,
`bright`, `contrast`, `freeze_frame`, `odd_even_frame`, `low_latency`,
`video_level_range`, `yuv_color_matrix`, `gamma`, `color_temp`, `log_mode`,
`ip`, `netmask`, `gateway`, `port`, `version`, `model`, `connected`.

## Feedbacks

Input source is selected, Is Multiview, Freeze frame active, Low latency on,
No input signal, Monitor unreachable.

## Presets

Source buttons (self-highlighting), function keys, freeze and low-latency
toggles, volume ±5, and a status tile.

## ⚠️ Multiview limitation

The monitor **cannot be switched into Multiview over the network** — this is a
limitation of the monitor's firmware, not this module. Multiview can only be
selected from the monitor's local front-panel menu. The module still **reports**
Multiview: when active, `$(bmh245:input_source)` reads `Multiview` and the
"Is Multiview" feedback turns on.
