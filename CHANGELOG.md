# Changelog

## 1.1.2
- Correct function keys to F1-F5 (the BM-H245 has five function keys, not six).

## 1.1.1
- Fix input-source feedback for sources whose reported status string differs
  from the command value: SQ reports `4xSDI SQD`, 2-SI reports `4xSDI 2SI`,
  SFP reports `SFP1`. Feedback now matches against the reported strings.

## 1.1.0
- Selected-source preset highlight changed to red.
- Relabel preset buttons: SQ → "4K SQD", 2-SI → "4K 2SI" (monitor-facing ids
  unchanged).

## 1.0.0
- Initial release. HTTP/CGI control of the SWIT BM-H245: input source, function
  keys, profiles, picture (volume/chroma/bright/contrast), freeze, odd/even
  field, low latency, and colour controls (level range, YUV matrix, gamma,
  colour temp, log mode). Live status polling exposes variables and feedbacks;
  presets included. Documents the firmware limitation that Multiview can be read
  but not set over the network.
