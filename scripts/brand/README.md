# Bondly icon artwork

The app icon, Android adaptive icon, splash image and favicon are drawn as SVG in
`build-icons.mjs` (the same hugging Bondlings as the Home hero) and rendered to PNG
with a small macOS Swift tool.

```bash
cd scripts/brand
node build-icons.mjs                      # writes the SVGs here
swiftc -O render.swift -o render          # one-off, needs Xcode command line tools
./render icon.svg ../../assets/images/icon.png 1024 1024
./render splash.svg ../../assets/images/splash-icon.png 1024 1024
./render android-foreground.svg ../../assets/images/android-icon-foreground.png 512 512
./render android-background.svg ../../assets/images/android-icon-background.png 512 512
./render android-monochrome.svg ../../assets/images/android-icon-monochrome.png 432 432
./render favicon.svg ../../assets/images/favicon.png 48 48
```

macOS's SVG reader is strict: an element with a duplicated attribute makes the whole
file fail to load ("cannot load svg").
