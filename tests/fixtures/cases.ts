import boardRegression from "./boards/mspm0g3507.json"
import { any_circuit_element, type AnyCircuitElement } from "circuit-json"
import type { ConversionOptions } from "../../index"

export interface VisualCase {
  name: string
  circuitJson: AnyCircuitElement[]
  options?: ConversionOptions
  note?: string
  viewport?: { minX: number; minY: number; maxX: number; maxY: number }
}
const element = (obj: unknown) =>
  any_circuit_element.parse(obj) as AnyCircuitElement
const square = (r: number) => [
  { x: -r, y: -r },
  { x: r, y: -r },
  { x: r, y: r },
  { x: -r, y: r },
]
const board = element({
  type: "pcb_board",
  pcb_board_id: "board",
  center: { x: 0, y: 0 },
  width: 14,
  height: 10,
  thickness: 1.6,
  num_layers: 4,
})
const smt = (fields: object) =>
  element({
    type: "pcb_smtpad",
    pcb_smtpad_id: "pad",
    x: 0,
    y: 0,
    layer: "top",
    ...fields,
  })
const plated = (fields: object) =>
  element({
    type: "pcb_plated_hole",
    pcb_plated_hole_id: "plated",
    x: 0,
    y: 0,
    layers: ["top", "bottom"],
    ...fields,
  })
const hole = (fields: object) =>
  element({ type: "pcb_hole", pcb_hole_id: "hole", x: 0, y: 0, ...fields })
const pour = (fields: object) =>
  element({
    type: "pcb_copper_pour",
    pcb_copper_pour_id: "pour",
    layer: "top",
    covered_with_solder_mask: false,
    ...fields,
  })
const cutout = (fields: object) =>
  element({ type: "pcb_cutout", pcb_cutout_id: "cutout", ...fields })
const keepout = (fields: object) =>
  element({
    type: "pcb_keepout",
    pcb_keepout_id: "keepout",
    layers: ["top"],
    ...fields,
  })
const courtyard = (type: string, fields: object) =>
  element({
    type,
    [`${type}_id`]: "courtyard",
    pcb_component_id: "component",
    layer: "top",
    ...fields,
  })
const via = element({
  type: "pcb_via",
  pcb_via_id: "via",
  x: 0,
  y: 0,
  outer_diameter: 2,
  hole_diameter: 0.8,
  layers: ["top", "bottom"],
})
const wire = (x: number, y: number, layer = "top", width = 0.7) => ({
  route_type: "wire",
  x,
  y,
  layer,
  width,
})
const trace = (route: object[], fields: object = {}) =>
  element({ type: "pcb_trace", pcb_trace_id: "trace", route, ...fields })
const component = element({
  type: "pcb_component",
  pcb_component_id: "component",
  source_component_id: "source",
  center: { x: 0, y: 0 },
  width: 6,
  height: 5,
  rotation: 35,
  layer: "top",
})
const arcRing = [
  { x: 3, y: 0, bulge: Math.tan(Math.PI / 8) },
  { x: 0, y: 3, bulge: Math.tan(Math.PI / 8) },
  { x: -3, y: 0, bulge: Math.tan(Math.PI / 8) },
  { x: 0, y: -3, bulge: Math.tan(Math.PI / 8) },
]
const add = (name: string, ...elements: AnyCircuitElement[]): VisualCase => ({
  name,
  circuitJson: [board, ...elements],
  options: { layer: "top" },
})

export const visualCases: VisualCase[] = [
  add("pad-circle", smt({ shape: "circle", radius: 1.5 })),
  add("pad-rect", smt({ shape: "rect", width: 5, height: 2 })),
  add(
    "pad-rounded-rect",
    smt({ shape: "rect", width: 5, height: 3, rect_border_radius: 0.6 }),
  ),
  add(
    "pad-corner-radius-alias",
    smt({ shape: "rect", width: 4, height: 3, corner_radius: 0.8 }),
  ),
  add(
    "pad-rotated-rect",
    smt({ shape: "rotated_rect", width: 5, height: 2, ccw_rotation: 35 }),
  ),
  add(
    "pad-rotated-rounded-rect",
    smt({
      shape: "rotated_rect",
      width: 5,
      height: 3,
      ccw_rotation: -40,
      rect_border_radius: 0.7,
    }),
  ),
  add(
    "pad-pill-horizontal",
    smt({ shape: "pill", width: 5, height: 2, radius: 1 }),
  ),
  add(
    "pad-pill-vertical",
    smt({ shape: "pill", width: 2, height: 5, radius: 1 }),
  ),
  add(
    "pad-pill-partial-rounding",
    smt({ shape: "pill", width: 5, height: 3, radius: 0.5 }),
  ),
  add(
    "pad-rotated-pill",
    smt({
      shape: "rotated_pill",
      width: 5,
      height: 2,
      radius: 1,
      ccw_rotation: 30,
    }),
  ),
  add(
    "pad-pill-circle",
    smt({ shape: "pill", width: 3, height: 3, radius: 1.5 }),
  ),
  add(
    "pad-polygon",
    smt({
      shape: "polygon",
      points: [
        { x: -3, y: -2 },
        { x: 2, y: -2 },
        { x: 3, y: 0 },
        { x: 0, y: 2 },
        { x: -3, y: 1 },
      ],
    }),
  ),
  add(
    "pad-concave-polygon",
    smt({
      shape: "polygon",
      points: [
        { x: -3, y: -2 },
        { x: 3, y: -2 },
        { x: 3, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: -3, y: 2 },
      ],
    }),
  ),
  add(
    "pad-duplicate-points",
    smt({
      shape: "polygon",
      points: [...square(2), { x: -2, y: 2 }, { x: -2, y: -2 }],
    }),
  ),
  add(
    "plated-circle",
    plated({ shape: "circle", outer_diameter: 4, hole_diameter: 2 }),
  ),
  add(
    "plated-oval",
    plated({
      shape: "oval",
      outer_width: 5,
      outer_height: 3,
      hole_width: 3,
      hole_height: 1.2,
      ccw_rotation: 0,
    }),
  ),
  add(
    "plated-pill-rotated",
    plated({
      shape: "pill",
      outer_width: 5,
      outer_height: 3,
      hole_width: 3,
      hole_height: 1.2,
      ccw_rotation: 40,
    }),
  ),
  add(
    "plated-rect-circle-offset",
    plated({
      shape: "circular_hole_with_rect_pad",
      hole_shape: "circle",
      pad_shape: "rect",
      rect_pad_width: 5,
      rect_pad_height: 4,
      hole_diameter: 1.2,
      hole_offset_x: 0.8,
      hole_offset_y: -0.4,
    }),
  ),
  add(
    "plated-rounded-rect-circle",
    plated({
      shape: "circular_hole_with_rect_pad",
      hole_shape: "circle",
      pad_shape: "rect",
      rect_pad_width: 5,
      rect_pad_height: 3,
      hole_diameter: 1.2,
      rect_border_radius: 0.7,
      rect_ccw_rotation: 25,
    }),
  ),
  add(
    "plated-rect-pill",
    plated({
      shape: "pill_hole_with_rect_pad",
      hole_shape: "pill",
      pad_shape: "rect",
      rect_pad_width: 6,
      rect_pad_height: 4,
      hole_width: 3,
      hole_height: 1.2,
    }),
  ),
  add(
    "plated-independent-rotations",
    plated({
      shape: "rotated_pill_hole_with_rect_pad",
      hole_shape: "rotated_pill",
      pad_shape: "rect",
      rect_pad_width: 6,
      rect_pad_height: 4,
      hole_width: 3,
      hole_height: 1.2,
      hole_ccw_rotation: -25,
      rect_ccw_rotation: 20,
      hole_offset_x: 0.3,
      hole_offset_y: 0.2,
      rect_border_radius: 0.5,
    }),
  ),
  add(
    "plated-polygon-circle",
    plated({
      shape: "hole_with_polygon_pad",
      hole_shape: "circle",
      pad_outline: [
        { x: -3, y: -2 },
        { x: 3, y: -2 },
        { x: 2, y: 2 },
        { x: -2, y: 2 },
      ],
      hole_diameter: 1.5,
      ccw_rotation: 20,
    }),
  ),
  add(
    "plated-polygon-component-rotation",
    component,
    plated({
      shape: "hole_with_polygon_pad",
      hole_shape: "circle",
      pad_outline: square(2),
      hole_diameter: 1.5,
      pcb_component_id: "component",
    }),
  ),
  add(
    "plated-polygon-pill",
    plated({
      shape: "hole_with_polygon_pad",
      hole_shape: "rotated_pill",
      pad_outline: square(2.5),
      hole_width: 3,
      hole_height: 1,
      ccw_rotation: 25,
    }),
  ),
  ...["circle", "square", "rect", "oval", "pill", "rotated_pill"].map((shape) =>
    add(
      `hole-${shape}`,
      hole({
        hole_shape: shape,
        hole_diameter: 2,
        hole_width: 5,
        hole_height: 2,
        ccw_rotation: 35,
      }),
    ),
  ),
  add("via-through", via),
  { ...add("via-inner-layer", via), options: { layer: "inner1" } },
  {
    ...add(
      "via-blind-inner-layer",
      element({ ...via, pcb_via_id: "blind", layers: ["top", "inner1"] }),
    ),
    options: { layer: "inner1" },
  },
  {
    ...add(
      "via-blind-excluded-bottom",
      element({ ...via, pcb_via_id: "blind", layers: ["top", "inner1"] }),
    ),
    options: { layer: "bottom" },
  },
  add("trace-horizontal", trace([wire(-4, 0), wire(4, 0)])),
  add("trace-diagonal", trace([wire(-4, -2), wire(4, 2)])),
  add(
    "trace-bends",
    trace([wire(-4, -2), wire(0, -2), wire(0, 2), wire(4, 2)]),
  ),
  add(
    "trace-width-change",
    trace([
      wire(-4, -2, "top", 0.5),
      wire(0, 0, "top", 1.5),
      wire(4, 2, "top", 1.5),
    ]),
  ),
  add(
    "trace-interpolated",
    trace([wire(-4, -1, "top", 0.5), wire(4, 1, "top", 2)], {
      route_thickness_mode: "interpolated",
    }),
  ),
  add(
    "trace-through-pad",
    trace([
      wire(-4, 0),
      {
        route_type: "through_pad",
        start: { x: -1, y: 0 },
        end: { x: 1, y: 0 },
        width: 1,
        start_layer: "top",
        end_layer: "top",
      },
      wire(4, 0),
    ]),
  ),
  ...(["top", "bottom", "inner1"] as const).map((layer) => ({
    ...add(
      `trace-layer-transition-${layer}`,
      trace([
        wire(-4, -2),
        wire(0, 0),
        {
          route_type: "via",
          x: 0,
          y: 0,
          from_layer: "top",
          to_layer: "bottom",
          outer_diameter: 1.2,
          hole_diameter: 0.5,
        },
        wire(0, 0, "bottom"),
        wire(4, 2, "bottom"),
      ]),
    ),
    options: { layer },
  })),
  add(
    "pour-rect-rotated",
    pour({
      shape: "rect",
      center: { x: 0, y: 0 },
      width: 6,
      height: 3,
      rotation: 25,
    }),
  ),
  add(
    "pour-polygon-concave",
    pour({
      shape: "polygon",
      points: [
        { x: -4, y: -3 },
        { x: 4, y: -3 },
        { x: 4, y: 3 },
        { x: 1, y: 3 },
        { x: 1, y: 0 },
        { x: -4, y: 0 },
      ],
    }),
  ),
  add(
    "pour-brep-straight-hole",
    pour({
      shape: "brep",
      brep_shape: {
        outer_ring: { vertices: square(3) },
        inner_rings: [{ vertices: square(1) }],
      },
    }),
  ),
  add(
    "pour-brep-multiple-holes",
    pour({
      shape: "brep",
      brep_shape: {
        outer_ring: { vertices: square(3) },
        inner_rings: [
          { vertices: square(0.7).map((p) => ({ x: p.x - 1.5, y: p.y })) },
          {
            vertices: square(0.7)
              .reverse()
              .map((p) => ({ x: p.x + 1.5, y: p.y })),
          },
        ],
      },
    }),
  ),
  add(
    "pour-brep-curved-outer",
    pour({
      shape: "brep",
      brep_shape: { outer_ring: { vertices: arcRing }, inner_rings: [] },
    }),
  ),
  add(
    "pour-brep-curved-hole",
    pour({
      shape: "brep",
      brep_shape: {
        outer_ring: { vertices: square(3.5) },
        inner_rings: [
          { vertices: arcRing.map((p) => ({ ...p, x: p.x / 2, y: p.y / 2 })) },
        ],
      },
    }),
  ),
  add(
    "pour-brep-two-semicircles",
    pour({
      shape: "brep",
      brep_shape: {
        outer_ring: {
          vertices: [
            { x: -3, y: 0, bulge: 1 },
            { x: 3, y: 0, bulge: 1 },
          ],
        },
        inner_rings: [],
      },
    }),
  ),
  add(
    "pour-brep-clockwise",
    pour({
      shape: "brep",
      brep_shape: {
        outer_ring: {
          vertices: arcRing.reverse().map((p) => ({ ...p, bulge: -p.bulge })),
        },
        inner_rings: [],
      },
    }),
  ),
  add(
    "keepout-rect",
    keepout({ shape: "rect", center: { x: 0, y: 0 }, width: 6, height: 3 }),
  ),
  add(
    "keepout-circle",
    keepout({ shape: "circle", center: { x: 0, y: 0 }, radius: 2 }),
  ),
  add(
    "keepout-outline",
    keepout({
      shape: "outline",
      outline: [
        { x: -3, y: -2 },
        { x: 3, y: -2 },
        { x: 0, y: 2 },
      ],
      stroke_width: 0.1,
    }),
  ),
  add(
    "cutout-rect-rounded",
    cutout({
      shape: "rect",
      center: { x: 0, y: 0 },
      width: 5,
      height: 3,
      rotation: 30,
      corner_radius: 0.7,
    }),
  ),
  add(
    "cutout-circle",
    cutout({ shape: "circle", center: { x: 0, y: 0 }, radius: 2 }),
  ),
  add(
    "cutout-polygon",
    cutout({
      shape: "polygon",
      points: [
        { x: -3, y: -2 },
        { x: 3, y: -2 },
        { x: 0, y: 2 },
      ],
    }),
  ),
  {
    ...add(
      "cutout-path",
      cutout({
        shape: "path",
        route: [
          { x: -3, y: -2 },
          { x: 0, y: 2 },
          { x: 3, y: -2 },
        ],
        slot_width: 1,
      }),
    ),
    note: "Reference renderer fills path vertices; converter models the specified slot width.",
  },
  add(
    "courtyard-rect",
    courtyard("pcb_courtyard_rect", {
      center: { x: 0, y: 0 },
      width: 6,
      height: 3,
      ccw_rotation: 25,
    }),
  ),
  add(
    "courtyard-circle",
    courtyard("pcb_courtyard_circle", { center: { x: 0, y: 0 }, radius: 2 }),
  ),
  add(
    "courtyard-pill",
    courtyard("pcb_courtyard_pill", {
      center: { x: 0, y: 0 },
      width: 5,
      height: 2,
      radius: 1,
    }),
  ),
  add(
    "courtyard-polygon",
    courtyard("pcb_courtyard_polygon", {
      points: [
        { x: -3, y: -2 },
        { x: 3, y: -2 },
        { x: 0, y: 2 },
      ],
    }),
  ),
  add(
    "courtyard-outline",
    courtyard("pcb_courtyard_outline", {
      outline: [
        { x: -3, y: -2 },
        { x: 3, y: -2 },
        { x: 0, y: 2 },
      ],
    }),
  ),
  { name: "board-rectangle", circuitJson: [board] },
  {
    name: "board-concave-outline",
    circuitJson: [
      element({
        ...board,
        outline: [
          { x: -6, y: -4 },
          { x: 6, y: -4 },
          { x: 6, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 4 },
          { x: -6, y: 4 },
        ],
      }),
    ],
  },
  ...(["top", "bottom", "inner1", "inner2"] as const).map((layer) => ({
    ...add(
      `layer-filter-${layer}`,
      ...(["top", "bottom", "inner1", "inner2"] as const).map((layer, i) =>
        smt({
          shape: "circle",
          pcb_smtpad_id: `pad-${layer}`,
          x: -4.5 + i * 3,
          y: 0,
          radius: 1,
          layer,
        }),
      ),
      via,
    ),
    options: { layer },
  })),
]

const referenceNotes: Record<string, string> = {
  "plated-polygon-circle":
    "Reference renderer ignores polygon-pad rotation; FlattenJS applies ccw_rotation.",
  "plated-polygon-component-rotation":
    "Reference renderer ignores component rotation for local polygon pads.",
  "plated-polygon-pill":
    "Reference renderer ignores polygon-pad and drill rotation; FlattenJS applies it.",
  "via-blind-excluded-bottom":
    "Reference renderer draws blind vias on every layer; bottom correctly excludes this via.",
  "keepout-outline":
    "Reference renderer omits outline keepouts; FlattenJS includes the filled region.",
  "courtyard-pill":
    "Reference renderer omits pill courtyards; FlattenJS includes their boundary.",
}
for (const fixture of visualCases) fixture.note ??= referenceNotes[fixture.name]
visualCases.push(
  add(
    "trace-interpolated-bend",
    trace(
      [
        wire(-4, -2, "top", 0.5),
        wire(0, -2, "top", 1),
        wire(1, 2, "top", 1.5),
        wire(4, 2, "top", 2),
      ],
      { route_thickness_mode: "interpolated" },
    ),
  ),
)

for (const layer of ["top", "bottom"] as const)
  visualCases.push({
    name: `mspm0g3507-${layer}`,
    circuitJson: boardRegression as AnyCircuitElement[],
    options: { layer },
    note: "Original PCB geometry; source and schematic records omitted. Reference pours are translucent.",
  })
visualCases.push({
  name: "mspm0g3507-usb-ground-short",
  circuitJson: boardRegression as AnyCircuitElement[],
  options: { layer: "top" },
  viewport: { minX: -42, minY: -4, maxX: -35, maxY: 4 },
  note: "USB-C pads and ground pour from the reported short. Reference pours are translucent.",
})

for (const fixture of visualCases) {
  if (fixture.name.startsWith("trace-layer-transition-"))
    fixture.note =
      "Reference estimates inline-via diameters; FlattenJS uses the explicit Circuit JSON diameters."
}
