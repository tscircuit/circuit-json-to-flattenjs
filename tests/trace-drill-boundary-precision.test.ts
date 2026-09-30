import { expect, test } from "bun:test"
import { convertCircuitJsonToFlattenJs } from "../index"
import { trace } from "./fixtures/tiny-trace-near-drill"

test("reproduce tiny trace boundary conflict during drill subtraction", () => {
  expect(() =>
    convertCircuitJsonToFlattenJs([trace], { strict: true }),
  ).toThrow("Unresolved boundary conflict in boolean operation")
})
