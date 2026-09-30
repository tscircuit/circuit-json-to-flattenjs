import { expect, test } from "bun:test"
import { Point } from "@flatten-js/core"
import type { PcbTrace } from "circuit-json"
import { convertCircuitJsonToFlattenJs } from "../index"

// Reduced from the smart-ring route that failed copper-pour DRC. The first
// segment is about 1.7e-6 mm long; its capsule intersects the embedded via drill.
const trace: PcbTrace = {
  type: "pcb_trace",
  pcb_trace_id: "tiny_segment_near_drill",
  route: [
    {
      route_type: "wire",
      x: -5.187482788357944,
      y: 0.8605189568595305,
      width: 0.15,
      layer: "bottom",
    },
    {
      route_type: "wire",
      x: -5.18748104314047,
      y: 0.8605189568595305,
      width: 0.15,
      layer: "bottom",
    },
    { route_type: "wire", x: -5.125, y: 0.923, width: 0.15, layer: "bottom" },
    {
      route_type: "via",
      x: -5.125,
      y: 0.923,
      from_layer: "bottom",
      to_layer: "top",
      outer_diameter: 0.45,
      hole_diameter: 0.2,
    },
  ],
}

test("tiny trace segments retain copper and exclude the via drill in strict conversion", () => {
  const converted = convertCircuitJsonToFlattenJs([trace], { strict: true })
  expect(converted.warnings).toEqual([])
  const bottom = converted.elements.find(
    (element) => element.layer === "bottom",
  )!
  expect(
    bottom.shapes.every((shape) => !shape.contains(new Point(-5.125, 0.923))),
  ).toBe(true)
  expect(
    bottom.shapes.some((shape) => shape.contains(new Point(-5.22, 0.82))),
  ).toBe(true)
  // The tiny wire capsule is the second shape after the annular via pad.
  // The expected area also catches a missing inverse scale.
  expect(bottom.shapes[1].area()).toBeCloseTo(0.0086088327459978, 10)
  expect(bottom.bounds.xmin).toBeCloseTo(-5.35, 8)
  expect(bottom.bounds.xmax).toBeCloseTo(-4.9, 8)
})
