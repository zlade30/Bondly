#!/bin/bash
# Renders the store screenshots from frames.html with headless Chrome.
#   ios/      1320×2868  App Store, 6.9" iPhone
#   ios-6.3/  1206×2622  App Store, 6.3" iPhone
#   android/  1080×1920  Google Play, phone
#   banners/  App Store header (3840×1646) and search result (3840×2560), from banner.html
# Re-run after changing frames.html or the screens in raw/.
set -euo pipefail
cd "$(dirname "$0")"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SLIDES=7

render() { # platform width height
  mkdir -p "$1"
  for s in $(seq 1 "$SLIDES"); do
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --allow-file-access-from-files --virtual-time-budget=4000 \
      --window-size="$2,$3" --screenshot="$PWD/$1/0$s.png" \
      "file://$PWD/frames.html?s=$s&p=$1" >/dev/null 2>&1
    echo "$1/0$s.png"
  done
}

render ios 1320 2868
render ios-6.3 1206 2622
render android 1080 1920

mkdir -p banners
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --allow-file-access-from-files \
  --virtual-time-budget=4000 --window-size=3840,1646 --screenshot="$PWD/banners/header-3840x1646.png" \
  "file://$PWD/banner.html?k=header" >/dev/null 2>&1 && echo banners/header-3840x1646.png
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --allow-file-access-from-files \
  --virtual-time-budget=4000 --window-size=3840,2560 --screenshot="$PWD/banners/search-3840x2560.png" \
  "file://$PWD/banner.html?k=search" >/dev/null 2>&1 && echo banners/search-3840x2560.png
