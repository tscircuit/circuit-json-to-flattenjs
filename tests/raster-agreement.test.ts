import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import { visualCases } from "./fixtures/cases"
import { renderComparison } from "./comparison"

// Compare actual copper silhouettes, independent of SVG path serialization and
// reference pour opacity. Known reference-renderer bugs have labeled fixtures
// and independent mathematical tests rather than a weakened pixel threshold.
for (const fixture of visualCases.filter(
  (f) => /^(pad|plated|via|trace|pour)-/.test(f.name) && !f.note,
)) {
  test(`copper raster agreement: ${fixture.name}`, () => {
    const { pixels } = new Resvg(renderComparison(fixture)).render()
    const isCopper = (x: number, y: number) => {
      const i = (y * 1020 + x) * 4
      const r = pixels[i],
        g = pixels[i + 1],
        b = pixels[i + 2]
      return (
        r > 65 && g > 35 && g < 155 && b < 90 && r > g * 1.45 && g > b * 1.35
      )
    }
    let union = 0,
      difference = 0
    for (let y = 80; y < 420; y++) {
      for (let x = 12; x < 498; x++) {
        const left = isCopper(x, y),
          right = isCopper(x + 510, y)
        if (left || right) union++
        if (left !== right) {
          // A one-pixel neighborhood accommodates edge antialiasing only.
          const otherX = left ? x + 510 : x
          let hasNeighbor = false
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (isCopper(otherX + dx, y + dy)) hasNeighbor = true
            }
          if (!hasNeighbor) difference++
        }
      }
    }
    expect(union).toBeGreaterThan(0)
    // No mismatched copper may extend beyond the one-pixel edge neighborhood.
    expect(difference).toBe(0)
  })
}
