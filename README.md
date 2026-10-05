# companion-module-swit-bmh245

A [Bitfocus Companion](https://bitfocus.io/companion) module to control a **SWIT BM-H245**
broadcast monitor over its built-in web interface (HTTP/CGI, default port **8080**).

The protocol was reverse-engineered from the monitor's own web UI and firmware, and every
command/parameter in this module matches exactly what the monitor's web page sends.

## What it can do

**Actions**
- Input source: SDI1-4, SQ, 2-SI, SFP, HDMI
- Function keys F1-F5
- Load user profile (1-4)
- Picture: volume (set / relative), chroma, brightness, contrast
- Freeze frame (Off / Full / Top / Bottom, plus a toggle)
- Odd/Even field freeze (interlaced sources only)
- Low latency (on / off / toggle)
- Color: video level range, YUV matrix, gamma/EOTF, color temperature, camera log mode
- Refresh status; advanced raw CGI command

**Variables** (`$(bmh245:...)`) — live-polled: `input_source`, `input_format`,
`loaded_profile`, `volume`, `chroma`, `bright`, `contrast`, `freeze_frame`,
`odd_even_frame`, `low_latency`, `video_level_range`, `yuv_color_matrix`, `gamma`,
`color_temp`, `log_mode`, `ip`, `netmask`, `gateway`, `port`, `version`, `model`, `connected`.

**Feedbacks** — input source selected, is Multiview, freeze active, low latency on,
no signal, monitor unreachable.

**Presets** — source buttons (self-highlighting), function keys, freeze/low-latency
toggles, volume ±5, and a status tile.

## ⚠️ Multiview limitation (important)

The monitor **cannot be switched into Multiview over the network** — this is a limitation
of the monitor's firmware, not the module. Verified on hardware: sending the Multiview
source value returns `ok` but the source does not change. Multiview can only be selected
from the monitor's **local front-panel menu**.

This module still **reports** Multiview: when the monitor is in Multiview the
`$(bmh245:input_source)` variable reads `Multiview` and the "is Multiview" feedback is
active — so you can display the state on a button, you just can't set it.

(If SWIT releases firmware that adds a settable Multiview command, add it to
`INPUT_SOURCES` in `src/constants.js` and it will work immediately.)

## Install (developer module)

This is a source module, so it needs its dependencies installed once on a machine that has
Node.js + npm:

```bash
cd companion-module-swit-bmh245
npm install
```

Then in Companion:
1. Settings → enable **Developer modules path** and point it at the folder that contains
   this module.
2. Restart Companion. Add a connection, search for **BM-H245**.
3. Set the monitor's **IP** (e.g. `10.0.0.59`), **port** (`8080`), and poll interval.

## Package for upload (one command on a Node machine)

To produce the uploadable Companion package (`pkg.tgz`, with the runtime bundled in):

```bash
cd companion-module-swit-bmh245
npm install
npm run package        # -> creates pkg.tgz
```

Then in Companion: **Connections → (+) Add → Import custom module → select `pkg.tgz`**.
(Requires Node.js + npm; nothing else.)

## Config

| Field | Default | Notes |
|---|---|---|
| Monitor IP | `10.0.0.59` | |
| Port | `8080` | The BM-H245 web UI is on 8080, **not** 80 |
| Poll interval | `2000` ms | 0 disables status polling |
| Request timeout | `4000` ms | |

## Protocol notes

- One HTTP GET per command: `GET /cgi-bin/getinfo.cgi?cmd=<Cmd>&param=<value>&k=<ms>`
- Status: `cmd=CmdQueryAll` returns a 22-field pipe-separated line (see `src/constants.js`).
- The monitor's embedded `thttpd` server returns slightly non-compliant HTTP headers, so the
  module enables Node's `insecureHTTPParser` (local-network device only).
- There is **no authentication** on the monitor's web interface — anyone on the network can
  control it. Keep it on a trusted/management network.

## License

MIT
