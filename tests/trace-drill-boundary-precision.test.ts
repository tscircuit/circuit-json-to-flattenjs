import { expect, test } from "bun:test"
import { Point } from "@flatten-js/core"
import { convertCircuitJsonToFlattenJs } from "../index"

import { trace } from "./fixtures/tiny-trace-near-drill"

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
