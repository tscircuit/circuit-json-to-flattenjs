import type { Box, Polygon } from "@flatten-js/core"
import type { AnyCircuitElement, LayerRef } from "circuit-json"

export type GeometryRole =
  | "copper"
  | "board"
  | "drill"
  | "cutout"
  | "keepout"
  | "courtyard"
export interface ConversionOptions {
  /** Select one layer, or use layers for several. Coordinates are never mirrored. */
  layer?: LayerRef
  layers?: readonly LayerRef[]
  /** Physical stack order; inferred from pcb_board.num_layers (otherwise observed layers). */
  copperLayers?: readonly LayerRef[]
  elementTypes?: readonly AnyCircuitElement["type"][]
  elementIds?: readonly string[]
  roles?: readonly GeometryRole[]
  /** Board outlines, cutouts and non-plated holes survive a layer filter by default. */
  includeLayerless?: boolean
  /** Subtract drills from via / plated-pad polygons. False returns copper envelopes. */
  includeDrillHoles?: boolean
  /** Throw on invalid/unsupported geometry of supported PCB elements instead of returning warnings. */
  strict?: boolean
  /** Maximum chord error for ellipses, in mm (default 0.001). Circular arcs remain exact. */
  curveTolerance?: number
}
export interface FlattenElement {
  elementId: string
  elementType: AnyCircuitElement["type"]
  sourceElement: AnyCircuitElement
  role: GeometryRole
  /** null for mechanical geometry shared by all layers. */
  layer: string | null
  /** Filled polygons with arc edges and hole faces; ellipses use curveTolerance. Shapes represent a union, not a sum of areas. */
  shapes: Polygon[]
  bounds: Box
}
export interface ConversionWarning {
  elementId: string
  elementType: string
  message: string
}
export interface FlattenConversionResult {
  elements: FlattenElement[]
  warnings: ConversionWarning[]
  bounds: Box | undefined
  copperLayers: readonly LayerRef[]
}
