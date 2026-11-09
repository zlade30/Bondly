import AppKit
// usage: render <in.svg> <out.png> <width> <height>
let a = CommandLine.arguments
guard a.count == 5, let w = Int(a[3]), let h = Int(a[4]) else { print("usage"); exit(1) }
guard let img = NSImage(contentsOf: URL(fileURLWithPath: a[1])) else { print("cannot load svg"); exit(1) }
guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
  samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { exit(1) }
rep.size = NSSize(width: w, height: h)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current?.imageInterpolation = .high
img.draw(in: NSRect(x: 0, y: 0, width: w, height: h), from: .zero, operation: .copy, fraction: 1)
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("wrote \(a[2]) \(w)x\(h)")
