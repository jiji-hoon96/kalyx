#!/usr/bin/env bash
# Encode every raw Playwright recording into a GitHub-ready WebM and an
# animated AVIF.
#
#   recordings/<picker>/<picker>.webm   (raw, Playwright VP8)
#        -> out/<picker>.webm           (optimized VP9, quiet color)
#        -> out/<picker>.avif           (animated AVIF for README <img>)
#
# Usage:
#   scripts/encode.sh            # encode all pickers found in recordings/
#   scripts/encode.sh datepicker # encode a single picker
#
# Env knobs:
#   FPS=15         output frame rate (default 15 — small files, smooth enough)
#   WIDTH=960      scale width in px, height auto (default 960; -1 keeps source)
#   CRF=32         VP9 quality for webm (lower = better/bigger, default 32)
#   AVIF_CRF=40    AVIF quality (lower = better/bigger, default 40)
set -euo pipefail

cd "$(dirname "$0")/.."

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found on PATH." >&2; exit 1; }

# Pick an available AV1 encoder for the animated AVIF. Homebrew ffmpeg ships
# libsvtav1 (fast); other builds may have libaom-av1. Prefer libaom for quality
# if present, else libsvtav1. Override with AVIF_ENCODER=<name>.
choose_av1_encoder() {
  if [ -n "${AVIF_ENCODER:-}" ]; then echo "$AVIF_ENCODER"; return; fi
  local list
  list="$(ffmpeg -hide_banner -encoders 2>/dev/null)"
  if echo "$list" | grep -q "libaom-av1"; then echo "libaom-av1"; return; fi
  if echo "$list" | grep -q "libsvtav1"; then echo "libsvtav1"; return; fi
  echo ""
}
AV1_ENC="$(choose_av1_encoder)"
if [ -z "$AV1_ENC" ]; then
  echo "No AV1 encoder (libaom-av1 / libsvtav1) found in ffmpeg — cannot make AVIF." >&2
  echo "Reinstall ffmpeg with AV1 support, e.g.  brew install ffmpeg" >&2
  exit 1
fi

FPS="${FPS:-15}"
WIDTH="${WIDTH:-960}"
CRF="${CRF:-32}"
AVIF_CRF="${AVIF_CRF:-40}"
# Optional crop applied BEFORE scaling, ffmpeg crop syntax "w:h:x:y"
# (e.g. CROP="600:460:560:170" to zoom into the playground preview panel).
CROP="${CROP:-}"

REC_DIR="recordings"
OUT_DIR="out"
mkdir -p "$OUT_DIR"

# Determine which pickers to encode.
if [ "$#" -gt 0 ]; then
  PICKERS=("$@")
else
  PICKERS=()
  for d in "$REC_DIR"/*/; do
    [ -d "$d" ] || continue
    PICKERS+=("$(basename "$d")")
  done
fi

if [ "${#PICKERS[@]}" -eq 0 ]; then
  echo "No recordings found under $REC_DIR/. Run \`pnpm record\` first." >&2
  exit 1
fi

# Shared filter chain: optional crop -> fps -> scale. -2 keeps aspect ratio
# while forcing an even height (required by the codecs).
if [ -n "$CROP" ]; then
  VF="crop=${CROP},fps=${FPS},scale=${WIDTH}:-2:flags=lanczos"
else
  VF="fps=${FPS},scale=${WIDTH}:-2:flags=lanczos"
fi

echo "Encoding ${#PICKERS[@]} picker(s): ${PICKERS[*]}"
echo "  fps=$FPS width=$WIDTH webm_crf=$CRF avif_crf=$AVIF_CRF avif_encoder=$AV1_ENC${CROP:+ crop=$CROP}"
echo

for p in "${PICKERS[@]}"; do
  src="$REC_DIR/$p/$p.webm"
  if [ ! -f "$src" ]; then
    echo "  ! skip $p — $src missing"
    continue
  fi

  webm_out="$OUT_DIR/$p.webm"
  avif_out="$OUT_DIR/$p.avif"

  # Trim start offset: env TRIM overrides; else per-picker sidecar written by
  # the recorder (skips page-load + hydration so the clip starts on a stable,
  # styled picker); else 0.
  trim="${TRIM:-}"
  if [ -z "$trim" ] && [ -f "$REC_DIR/$p/$p.trim" ]; then
    trim="$(cat "$REC_DIR/$p/$p.trim")"
  fi
  trim="${trim:-0}"
  ss_args=()
  if [ "$(printf '%.0f' "$(echo "$trim > 0" | bc -l)" 2>/dev/null)" = "1" ]; then
    ss_args=(-ss "$trim")
  fi

  echo "  → $p${trim:+ (trim ${trim}s)}"

  # 1) Optimized WebM (VP9). -an drops audio (there is none anyway).
  ffmpeg -y -loglevel error "${ss_args[@]}" -i "$src" \
    -vf "$VF" \
    -c:v libvpx-vp9 -crf "$CRF" -b:v 0 -row-mt 1 -an \
    "$webm_out"

  # 2) Animated AVIF. An AV1 stream in a .avif container renders inline in
  #    GitHub Markdown via <img>. Encoder-specific speed flags:
  #      libaom-av1 -> -cpu-used 6 ; libsvtav1 -> -preset 6
  if [ "$AV1_ENC" = "libaom-av1" ]; then
    ffmpeg -y -loglevel error "${ss_args[@]}" -i "$src" \
      -vf "$VF" \
      -c:v libaom-av1 -crf "$AVIF_CRF" -b:v 0 -cpu-used 6 -pix_fmt yuv420p \
      -f avif "$avif_out"
  else
    ffmpeg -y -loglevel error "${ss_args[@]}" -i "$src" \
      -vf "$VF" \
      -c:v libsvtav1 -crf "$AVIF_CRF" -preset 6 -pix_fmt yuv420p \
      -f avif "$avif_out"
  fi

  wsz=$(du -h "$webm_out" | cut -f1)
  asz=$(du -h "$avif_out" | cut -f1)
  echo "     webm=$wsz  avif=$asz"
done

echo
echo "Done. Optimized assets in $OUT_DIR/"
