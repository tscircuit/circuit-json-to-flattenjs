import type { Polygon } from "@flatten-js/core"
import type { AnyCircuitElement, PcbCutout } from "circuit-json"
import { circle, rectangle, ring, stroke, withHoles } from "./geometry"
import { getCopperLayers, spanLayers } from "./layers"
import { nonPlatedHole, platedHole, smtPad } from "./pads"
import { traceGeometry } from "./traces"
import type {
  ConversionOptions,
  FlattenConversionResult,
  FlattenElement,
  GeometryRole,
} from "./types"

export const supportedElementTypes = [
  "pcb_board",
  "pcb_smtpad",
  "pcb_plated_hole",
  "pcb_hole",
  "pcb_via",
  "pcb_trace",
  "pcb_copper_pour",
  "pcb_cutout",
  "pcb_keepout",
  "pcb_courtyard_rect",
  "pcb_courtyard_circle",
  "pcb_courtyard_pill",
  "pcb_courtyard_polygon",
  "pcb_courtyard_outline",
] as const

function cutoutGeometry(cutout: PcbCutout): Polygon[] {
  switch (cutout.shape) {
    case "circle":
      return [circle(cutout.center, cutout.radius)]
    case "rect":
      return [
        rectangle(
          cutout.center,
          cutout.width,
          cutout.height,
          cutout.rotation,
          cutout.corner_radius,
        ),
      ]
    case "polygon":
      return [ring(cutout.points)]
    case "path": {
      if (
        cutout.slot_length !== undefined ||
        cutout.space_between_slots !== undefined ||
        cutout.slot_corner_radius !== undefined
      ) {
        throw new Error(
          "Patterned/custom-corner path cutouts are not supported; use explicit rect/polygon cutouts",
        )
      }
      return cutout.route
        .slice(1)
        .map((p, i) => stroke(cutout.route[i], p, cutout.slot_width))
    }
  }
}

export function convertCircuitJsonToFlattenJs(
  json: readonly AnyCircuitElement[],
  options: ConversionOptions = {},
): FlattenConversionResult {
  if (options.layer && options.layers)
    throw new Error("Specify layer or layers, not both")
  const selectedLayers = options.layer ? [options.layer] : options.layers
  const stack = getCopperLayers(json, options)
  const result: FlattenConversionResult = {
    elements: [],
    warnings: [],
    bounds: undefined,
    copperLayers: stack,
  }
  const rotations = new Map(
    json
      .filter((e) => e.type === "pcb_component")
      .map((e) => [e.pcb_component_id, e.rotation]),
  )
  const tolerance = options.curveTolerance ?? 0.001
  if (!Number.isFinite(tolerance) || tolerance <= 0)
    throw new Error("curveTolerance must be finite and positive")
  const includeDrill = options.includeDrillHoles !== false
  for (const element of json) {
    if (!(supportedElementTypes as readonly string[]).includes(element.type))
      continue
    const elementId = (element as unknown as Record<string, unknown>)[
      `${element.type}_id`
    ] as string
    if (options.elementTypes && !options.elementTypes.includes(element.type))
      continue
    if (options.elementIds && !options.elementIds.includes(elementId)) continue
    let role: GeometryRole = "copper"
    let layers: (string | null)[] = [null]
    let shapes: Polygon[] = []
    let byLayer: Map<string, Polygon[]> | undefined
    try {
      switch (element.type) {
        case "pcb_smtpad":
          layers = [element.layer]
          shapes = [smtPad(element)]
          break
        case "pcb_plated_hole":
          layers = spanLayers(element.layers, stack)
          shapes = [
            platedHole(
              element,
              rotations.get(element.pcb_component_id ?? "") ?? 0,
              includeDrill,
              tolerance,
            ),
          ]
          break
        case "pcb_via": {
          layers = spanLayers(element.layers, stack)
          const outer = circle(element, element.outer_diameter / 2)
          shapes = [
            includeDrill
              ? withHoles(outer, [circle(element, element.hole_diameter / 2)])
              : outer,
          ]
          break
        }
        case "pcb_trace":
          byLayer = traceGeometry(element, stack, includeDrill)
          layers = [...byLayer.keys()]
          break
        case "pcb_copper_pour":
          layers = [element.layer]
          shapes = [
            element.shape === "rect"
              ? rectangle(
                  element.center,
                  element.width,
                  element.height,
                  element.rotation,
                )
              : element.shape === "polygon"
                ? ring(element.points)
                : withHoles(
                    ring(element.brep_shape.outer_ring.vertices),
                    element.brep_shape.inner_rings.map(
                      (h: { vertices: import("./geometry").Vertex[] }) =>
                        ring(h.vertices),
                    ),
                  ),
          ]
          break
        case "pcb_board":
          role = "board"
          shapes = [
            element.outline?.length
              ? ring(element.outline)
              : rectangle(element.center, element.width!, element.height!),
          ]
          break
        case "pcb_hole":
          role = "drill"
          shapes = [nonPlatedHole(element, tolerance)]
          break
        case "pcb_cutout":
          role = "cutout"
          shapes = cutoutGeometry(element)
          break
        case "pcb_keepout":
          role = "keepout"
          layers = element.layers
          shapes = [
            element.shape === "circle"
              ? circle(element.center, element.radius)
              : element.shape === "rect"
                ? rectangle(element.center, element.width, element.height)
                : ring(element.outline),
          ]
          break
        case "pcb_courtyard_rect":
          role = "courtyard"
          layers = [element.layer]
          shapes = [
            rectangle(
              element.center,
              element.width,
              element.height,
              element.ccw_rotation,
            ),
          ]
          break
        case "pcb_courtyard_circle":
          role = "courtyard"
          layers = [element.layer]
          shapes = [circle(element.center, element.radius)]
          break
        case "pcb_courtyard_pill":
          role = "courtyard"
          layers = [element.layer]
          shapes = [
            rectangle(
              element.center,
              element.width,
              element.height,
              0,
              element.radius,
            ),
          ]
          break
        case "pcb_courtyard_polygon":
          role = "courtyard"
          layers = [element.layer]
          shapes = [ring(element.points)]
          break
        case "pcb_courtyard_outline":
          role = "courtyard"
          layers = [element.layer]
          shapes = [ring(element.outline)]
          break
      }
      if (options.roles && !options.roles.includes(role)) continue
      const convertedElements: FlattenElement[] = []
      for (const layer of new Set(layers)) {
        if (
          layer === null
            ? options.includeLayerless === false
            : selectedLayers && !selectedLayers.includes(layer as never)
        )
          continue
        const layerShapes = byLayer?.get(layer!) ?? shapes
        if (!layerShapes.length) continue
        const bounds = layerShapes.reduce(
          (box, shape) => box.merge(shape.box),
          layerShapes[0].box,
        )
        if (
          ![bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax].every(
            Number.isFinite,
          )
        )
          throw new Error("Non-finite geometry bounds")
        const converted: FlattenElement = {
          elementId,
          elementType: element.type,
          sourceElement: element,
          role,
          layer,
          shapes: layerShapes,
          bounds,
        }
        convertedElements.push(converted)
      }
      for (const converted of convertedElements) {
        result.elements.push(converted)
        result.bounds = result.bounds
          ? result.bounds.merge(converted.bounds)
          : converted.bounds
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (options.strict) throw new Error(`${elementId}: ${message}`)
      result.warnings.push({ elementId, elementType: element.type, message })
    }
  }
  return result
}

/** Provide the enclosing circuit for board stackup and component-local polygon pads. */
export function convertCircuitJsonElementToFlattenJs(
  element: AnyCircuitElement,
  options: ConversionOptions & {
    circuitJson?: readonly AnyCircuitElement[]
  } = {},
): FlattenConversionResult {
  const { circuitJson = [], ...conversionOptions } = options
  const id = (element as unknown as Record<string, unknown>)[
    `${element.type}_id`
  ] as string
  const context = circuitJson.filter(
    (e) =>
      e !== element &&
      (e as unknown as Record<string, unknown>)[`${e.type}_id`] !== id,
  )
  return convertCircuitJsonToFlattenJs([...context, element], {
    ...conversionOptions,
    elementIds: [id],
  })
}
