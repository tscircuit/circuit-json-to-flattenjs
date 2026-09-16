import { Arc, type Polygon, type Point } from "@flatten-js/core"

// SVG precision is intentionally separate from the full-precision geometry.
// Normalize -0 and libm rounding differences across supported JS platforms.
const number = (value: number) => String(Number(value.toFixed(8)))
const point = (p: Point) => `${number(p.x)},${number(p.y)}`

export function polygonToSvg(
  polygon: Polygon,
  attrs: { fill: string; stroke: string; strokeWidth?: number },
): string {
  const paths = [...polygon.faces].map((face) => {
    const edges = face.shapes
    if (!edges.length) return ""
    const commands = [`M${point(edges[0].start)}`]
    for (const shape of edges) {
      if (shape instanceof Arc) {
        const sweep = shape.counterClockwise ? 1 : 0
        const arc = (end: Point, large = 0) =>
          `A${number(shape.r)},${number(shape.r)} 0 ${large},${sweep} ${point(end)}`
        if (shape.sweep >= 2 * Math.PI - 1e-9) {
          commands.push(arc(shape.middle()), arc(shape.end))
        } else {
          // A semicircle can land just above pi on one platform and below on
          // another. Either flag draws it identically, so canonicalize it.
          commands.push(arc(shape.end, shape.sweep > Math.PI + 1e-9 ? 1 : 0))
        }
      } else commands.push(`L${point(shape.end)}`)
    }
    return `${commands.join(" ")} Z`
  })
  return `<path fill="${attrs.fill}" stroke="${attrs.stroke}" stroke-width="${attrs.strokeWidth ?? 0}" fill-rule="evenodd" d="${paths.join(" ")}"/>`
}
