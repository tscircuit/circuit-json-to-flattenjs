import * as F from "@flatten-js/core"

export type XY = { x: number; y: number }
export type Vertex = XY & { bulge?: number }
const EPS = 1e-9
export const point = (p: XY) => new F.Point(p.x, p.y)

export function positive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`${name} must be finite and positive`)
  return value
}

export function circle(center: XY, radius: number): F.Polygon {
  positive(radius, "radius")
  return new F.Polygon(new F.Circle(point(center), radius))
}

/** Straight and circular edges, including two-vertex rings made of two arcs. */
export function ring(vertices: readonly Vertex[]): F.Polygon {
  const clean = vertices.filter(
    (p, i) => i === 0 || point(p).distanceTo(point(vertices[i - 1]))[0] > EPS,
  )
  if (
    clean.length > 1 &&
    point(clean[0]).distanceTo(point(clean.at(-1)!))[0] <= EPS
  )
    clean.pop()
  if (clean.length < 2)
    throw new Error("A ring needs at least two distinct vertices")
  const edges: (F.Segment | F.Arc)[] = clean.map((a, i) => {
    const b = clean[(i + 1) % clean.length]
    if (![a.x, a.y, a.bulge ?? 0].every(Number.isFinite))
      throw new Error("Non-finite ring vertex")
    const bulge = a.bulge ?? 0
    if (Math.abs(bulge) <= EPS) return new F.Segment(point(a), point(b))
    const dx = b.x - a.x,
      dy = b.y - a.y
    const length = Math.hypot(dx, dy)
    const offset = (length * (1 - bulge * bulge)) / (4 * bulge)
    const center = new F.Point(
      (a.x + b.x) / 2 - (dy / length) * offset,
      (a.y + b.y) / 2 + (dx / length) * offset,
    )
    return new F.Arc(
      center,
      (length * (1 + bulge * bulge)) / (4 * Math.abs(bulge)),
      Math.atan2(a.y - center.y, a.x - center.x),
      Math.atan2(b.y - center.y, b.x - center.x),
      bulge > 0,
    )
  })
  const polygon = new F.Polygon()
  polygon.addFace(edges)
  if (polygon.area() <= EPS)
    throw new Error("A ring must enclose a non-zero area")
  return polygon
}

/** Exact rounded boundary: one face, not overlapping bands and circles. */
export function rectangle(
  center: XY,
  width: number,
  height: number,
  rotation = 0,
  radius = 0,
): F.Polygon {
  positive(width, "width")
  positive(height, "height")
  if (!Number.isFinite(rotation) || !Number.isFinite(radius) || radius < 0)
    throw new Error("Invalid rectangle rotation or corner radius")
  const r = Math.min(radius, width / 2, height / 2)
  const x = width / 2,
    y = height / 2
  let polygon: F.Polygon
  if (r <= EPS)
    polygon = ring([
      { x: -x, y: -y },
      { x, y: -y },
      { x, y },
      { x: -x, y },
    ])
  else {
    const corners = [
      new F.Point(x - r, -y + r),
      new F.Point(x - r, y - r),
      new F.Point(-x + r, y - r),
      new F.Point(-x + r, -y + r),
    ]
    const edges: (F.Arc | F.Segment)[] = []
    for (let i = 0; i < 4; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 2
      const arc = new F.Arc(corners[i], r, angle, angle + Math.PI / 2, true)
      const next = corners[(i + 1) % 4]
      const nextStart = new F.Point(
        next.x + r * Math.cos(angle + Math.PI / 2),
        next.y + r * Math.sin(angle + Math.PI / 2),
      )
      edges.push(arc)
      if (arc.end.distanceTo(nextStart)[0] > EPS)
        edges.push(new F.Segment(arc.end, nextStart))
    }
    polygon = new F.Polygon()
    polygon.addFace(edges)
  }
  return polygon
    .rotate((rotation * Math.PI) / 180)
    .translate(new F.Vector(center.x, center.y))
}

/** Capsule / convex hull of endpoint discs. Equal radii give a round trace. */
export function stroke(
  a: XY,
  b: XY,
  widthA: number,
  widthB = widthA,
): F.Polygon {
  const r1 = positive(widthA, "trace width") / 2,
    r2 = positive(widthB, "trace width") / 2
  const d = point(a).distanceTo(point(b))[0]
  if (d <= Math.abs(r1 - r2) + EPS)
    return circle(r1 >= r2 ? a : b, Math.max(r1, r2))
  const theta = Math.atan2(b.y - a.y, b.x - a.x)
  const alpha = Math.acos((r1 - r2) / d)
  const low = theta - alpha,
    high = theta + alpha
  const p = (c: XY, r: number, angle: number) =>
    new F.Point(c.x + r * Math.cos(angle), c.y + r * Math.sin(angle))
  const polygon = new F.Polygon()
  polygon.addFace([
    new F.Segment(p(a, r1, low), p(b, r2, low)),
    new F.Arc(point(b), r2, low, high, true),
    new F.Segment(p(b, r2, high), p(a, r1, high)),
    new F.Arc(point(a), r1, high, low, true),
  ])
  return polygon
}

/** Add an interior void with winding opposite to the outer boundary. */
export function withHoles(
  outer: F.Polygon,
  holes: readonly F.Polygon[],
): F.Polygon {
  const result = outer.clone()
  const orientation = [...result.faces][0].orientation()
  for (const hole of holes) {
    const copy = hole.clone()
    if ([...copy.faces][0].orientation() === orientation) copy.reverse()
    for (const face of copy.faces) result.addFace(face.shapes)
  }
  return result
}

/** FlattenJS has no ellipse primitive. Bound chord error in millimetres. */
export function ellipse(
  center: XY,
  width: number,
  height: number,
  rotation = 0,
  tolerance = 0.001,
): F.Polygon {
  positive(width, "ellipse width")
  positive(height, "ellipse height")
  positive(tolerance, "curveTolerance")
  if (Math.abs(width - height) < EPS) return circle(center, width / 2)
  const radius = Math.max(width, height) / 2
  const count = Math.max(
    16,
    Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - tolerance / radius))),
  )
  if (count > 100000)
    throw new Error("curveTolerance requires more than 100000 ellipse segments")
  return ring(
    Array.from({ length: count }, (_, i) => ({
      x: (width / 2) * Math.cos((i * 2 * Math.PI) / count),
      y: (height / 2) * Math.sin((i * 2 * Math.PI) / count),
    })),
  )
    .rotate((rotation * Math.PI) / 180)
    .translate(new F.Vector(center.x, center.y))
}
