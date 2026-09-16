import { expect, test } from "bun:test"
import { Arc, Point, Polygon } from "@flatten-js/core"
import {
  convertCircuitJsonToFlattenJs as convert,
  convertCircuitJsonElementToFlattenJs as convertOne,
  renderFlattenJsToSvg,
} from "../index"
import { visualCases } from "./fixtures/cases"
import { circle, ellipse, rectangle, ring, stroke } from "../lib/geometry"
import type { AnyCircuitElement } from "circuit-json"

const fixture = (name: string) => visualCases.find((f) => f.name === name)!
const copper = (name: string) => {
  const f = fixture(name)
  return convert(f.circuitJson, {
    ...f.options,
    roles: ["copper"],
    strict: true,
  }).elements[0].shapes[0]
}
const near = (actual: number, expected: number) =>
  expect(actual).toBeCloseTo(expected, 7)

test("all visual fixtures produce native polygons with finite, non-zero geometry", () => {
  for (const f of visualCases) {
    const r = convert(f.circuitJson, { ...f.options, strict: true })
    expect(r.warnings).toEqual([])
    for (const e of r.elements)
      for (const shape of e.shapes) {
        expect(shape).toBeInstanceOf(Polygon)
        expect(shape.area()).toBeGreaterThan(0)
        expect(shape.isValid()).toBe(true)
      }
  }
})

test("circle and capsule boundaries are exact arcs", () => {
  near(copper("pad-circle").area(), Math.PI * 1.5 ** 2)
  near(copper("pad-pill-horizontal").area(), 6 + Math.PI)
  near(
    copper("pad-pill-partial-rounding").area(),
    15 - (4 - Math.PI) * 0.5 ** 2,
  )
  expect(
    [...copper("pad-circle").edges].every((e) => e.shape instanceof Arc),
  ).toBe(true)
  near(stroke({ x: 0, y: 0 }, { x: 4, y: 0 }, 2).area(), 8 + Math.PI)
  near(stroke({ x: 2, y: 3 }, { x: 2, y: 3 }, 2).area(), Math.PI)
})

test("rounded rectangle clamps radius and rotates about its center", () => {
  const p = rectangle({ x: 10, y: 20 }, 4, 2, 90, 0.5)
  near(p.box.xmin, 9)
  near(p.box.xmax, 11)
  near(p.box.ymin, 18)
  near(p.box.ymax, 22)
  near(p.area(), 8 - (4 - Math.PI) * 0.25)
  near(rectangle({ x: 0, y: 0 }, 2, 2, 0, 10).area(), Math.PI)
})

test("plated holes remove area and containment; optional envelopes preserve outer copper", () => {
  const p = copper("plated-circle")
  near(p.area(), 3 * Math.PI)
  expect(p.contains(new Point(0, 0))).toBe(false)
  expect(p.contains(new Point(1.5, 0))).toBe(true)
  const f = fixture("plated-circle")
  const envelope = convert(f.circuitJson, {
    roles: ["copper"],
    layer: "top",
    includeDrillHoles: false,
  }).elements[0].shapes[0]
  near(envelope.area(), 4 * Math.PI)
  expect(envelope.contains(new Point(0, 0))).toBe(true)
})

test("offset drills retain their absolute offset independently of pad rotation", () => {
  const p = copper("plated-rect-circle-offset")
  expect(p.contains(new Point(0.8, -0.4))).toBe(false)
  expect(p.contains(new Point(-1, 0))).toBe(true)
  near(p.area(), 20 - Math.PI * 0.6 ** 2)
})

test("BRep voids normalize ring winding without filling holes", () => {
  const p = copper("pour-brep-multiple-holes")
  near(p.area(), 36 - 2 * 1.4 ** 2)
  expect(p.contains(new Point(-1.5, 0))).toBe(false)
  expect(p.contains(new Point(1.5, 0))).toBe(false)
  expect(p.contains(new Point(0, 0))).toBe(true)
  const curved = copper("pour-brep-curved-hole")
  near(curved.area(), 49 - Math.PI * 1.5 ** 2)
  expect(curved.contains(new Point(1, 1))).toBe(false)
})

test("BRep supports clockwise arcs and two semicircles", () => {
  for (const name of [
    "pour-brep-clockwise",
    "pour-brep-curved-outer",
    "pour-brep-two-semicircles",
  ]) {
    const p = copper(name)
    near(p.area(), 9 * Math.PI)
    near(p.box.xmin, -3)
    near(p.box.xmax, 3)
    expect(p.contains(new Point(2, 2))).toBe(true)
  }
})

test("ellipses honor the requested chord tolerance", () => {
  const fine = ellipse({ x: 0, y: 0 }, 6, 2, 0, 0.0001)
  const coarse = ellipse({ x: 0, y: 0 }, 6, 2, 0, 0.1)
  expect(fine.edges.size).toBeGreaterThan(coarse.edges.size)
  expect(Math.abs(fine.area() - 3 * Math.PI)).toBeLessThan(0.002)
  for (const e of fine.edges) {
    const mid = e.shape.middle()
    // Normalize to the ellipse; chord error is below the requested physical tolerance.
    const scaled = Math.hypot(mid.x / 3, mid.y)
    expect((1 - scaled) * 3).toBeLessThanOrEqual(0.000100001)
  }
})

test("all layer selectors keep only matching copper, while mechanical geometry is configurable", () => {
  const f = fixture("layer-filter-top")
  const r = convert(f.circuitJson, {
    layers: ["inner1", "bottom"],
    includeLayerless: false,
  })
  expect(new Set(r.elements.map((e) => e.layer))).toEqual(
    new Set(["inner1", "bottom"]),
  )
  expect(r.elements.filter((e) => e.elementType === "pcb_via")).toHaveLength(2)
  expect(
    convert(f.circuitJson, { layers: [], includeLayerless: false }).elements,
  ).toEqual([])
  expect(
    convert(f.circuitJson, { layers: [] }).elements.map((e) => e.role),
  ).toEqual(["board"])
  expect(() =>
    convert(f.circuitJson, { layer: "top", layers: ["bottom"] }),
  ).toThrow()
})

test("blind vias stop at their last physical layer", () => {
  const f = fixture("via-blind-inner-layer")
  expect(
    convert(f.circuitJson, { roles: ["copper"] }).elements.map((e) => e.layer),
  ).toEqual(["top", "inner1"])
  expect(
    convert(f.circuitJson, { layer: "bottom", roles: ["copper"] }).elements,
  ).toEqual([])
})

test("explicit stackup controls through-via spans", () => {
  const f = fixture("via-through")
  const r = convert(f.circuitJson, {
    roles: ["copper"],
    copperLayers: ["top", "inner1", "inner2", "inner3", "inner4", "bottom"],
  })
  expect(r.elements).toHaveLength(6)
  expect(() =>
    convert(f.circuitJson, { copperLayers: ["top", "top"] }),
  ).toThrow()
})

test("trace layer transitions do not invent cross-layer wire segments", () => {
  const f = fixture("trace-layer-transition-inner1")
  const r = convert(f.circuitJson, {
    layer: "inner1",
    roles: ["copper"],
    strict: true,
  })
  expect(r.elements).toHaveLength(1)
  near(r.elements[0].bounds.width, 1.2)
  expect(r.elements[0].shapes[0].contains(new Point(-2, -1))).toBe(false)
})

test("single-element conversion uses board/component context without returning unrelated elements", () => {
  const f = fixture("plated-polygon-component-rotation")
  const e = f.circuitJson.find((e) => e.type === "pcb_plated_hole")!
  const r = convertOne(e, {
    circuitJson: f.circuitJson,
    layer: "top",
    strict: true,
  })
  expect(r.elements).toHaveLength(1)
  expect(r.elements[0].sourceElement).toBe(e)
  const expected =
    4 * (Math.cos((35 * Math.PI) / 180) + Math.sin((35 * Math.PI) / 180))
  near(r.elements[0].bounds.width, expected)
})

test("element type, role and ID filters compose", () => {
  const f = fixture("layer-filter-top")
  const r = convert(f.circuitJson, {
    elementTypes: ["pcb_smtpad"],
    elementIds: ["pad-top"],
    roles: ["copper"],
  })
  expect(r.elements.map((e) => e.elementId)).toEqual(["pad-top"])
})

test("conversion never mutates input and reports invalid geometry", () => {
  const f = structuredClone(fixture("pour-brep-multiple-holes"))
  const before = JSON.stringify(f)
  convert(f.circuitJson)
  expect(JSON.stringify(f)).toBe(before)
  const bad = {
    type: "pcb_smtpad",
    pcb_smtpad_id: "bad",
    shape: "circle",
    x: 0,
    y: 0,
    radius: -1,
    layer: "top",
  } as AnyCircuitElement
  expect(convert([bad]).warnings[0].elementId).toBe("bad")
  expect(convert([bad]).elements).toEqual([])
  expect(() => convert([bad], { strict: true })).toThrow("bad")
  expect(() =>
    ring([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]),
  ).toThrow()
})

test("unsupported patterned cutouts produce an actionable warning", () => {
  const f = structuredClone(fixture("cutout-path"))
  const cutout = f.circuitJson.find((e) => e.type === "pcb_cutout")!
  if (cutout.shape !== "path") throw new Error("expected path")
  cutout.slot_length = 2
  expect(convert(f.circuitJson).warnings[0].message).toContain("Patterned")
})

test("empty and non-PCB circuits are valid and render without invalid bounds", () => {
  const r = convert([])
  expect(r.elements).toEqual([])
  expect(r.bounds).toBeUndefined()
  expect(renderFlattenJsToSvg(r)).not.toContain("Infinity")
})

test("embedded via drills also remove copper from adjoining trace segments", () => {
  for (const layer of ["top", "bottom"] as const) {
    const f = fixture(`trace-layer-transition-${layer}`)
    const r = convert(f.circuitJson, { layer, roles: ["copper"], strict: true })
    expect(r.elements[0].shapes.some((s) => s.contains(new Point(0, 0)))).toBe(
      false,
    )
    expect(
      r.elements[0].shapes.some((s) => s.contains(new Point(0.4, 0))),
    ).toBe(true)
  }
})

test("via span direction does not constrain route traversal", () => {
  const f = structuredClone(fixture("trace-layer-transition-top"))
  const trace = f.circuitJson.find((e) => e.type === "pcb_trace")!
  const via = trace.route.find((p) => p.route_type === "via")!
  via.from_layer = "bottom"
  via.to_layer = "top"
  const r = convert(f.circuitJson, {
    layer: "top",
    roles: ["copper"],
    strict: true,
  })
  expect(r.elements[0].shapes.some((s) => s.contains(new Point(-2, -1)))).toBe(
    true,
  )
})

test("rendered SVG escapes source IDs and custom colors", () => {
  const f = structuredClone(fixture("pad-circle"))
  const pad = f.circuitJson.find((e) => e.type === "pcb_smtpad")!
  pad.pcb_smtpad_id = 'pad"/><script>alert(1)</script>'
  const svg = renderFlattenJsToSvg(convert(f.circuitJson), {
    colors: { copper: 'red" onload="bad' },
  })
  expect(svg).not.toContain("<script>")
  expect(svg).not.toContain('onload="bad')
  expect(svg).toContain("&quot;")
})

test("non-positive interpolated widths are reported instead of producing inverted copper", () => {
  const f = structuredClone(fixture("trace-interpolated"))
  const trace = f.circuitJson.find((e) => e.type === "pcb_trace")!
  const p = trace.route[0]
  if (p.route_type === "wire") p.width = -1
  expect(convert(f.circuitJson).warnings[0].message).toContain("trace width")
})
