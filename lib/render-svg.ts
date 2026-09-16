import type { FlattenConversionResult, GeometryRole } from "./types"
export interface FlattenSvgOptions {
  width?: number
  height?: number
  padding?: number
  background?: string
  viewport?: { minX: number; minY: number; maxX: number; maxY: number }
  colors?: Partial<Record<GeometryRole, string>>
}
const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

/** SVG generated only from FlattenJS polygons; +Y remains up in circuit coordinates. */
export function renderFlattenJsToSvg(
  result: FlattenConversionResult,
  options: FlattenSvgOptions = {},
): string {
  const width = options.width ?? 500,
    height = options.height ?? 360
  const padding = options.padding ?? 1
  const b = result.bounds
  const v = options.viewport ?? {
    minX: (b?.xmin ?? -1) - padding,
    minY: (b?.ymin ?? -1) - padding,
    maxX: (b?.xmax ?? 1) + padding,
    maxY: (b?.ymax ?? 1) + padding,
  }
  const colors = {
    copper: "#c87828",
    board: "#59726b",
    drill: "#0b1018",
    cutout: "#0b1018",
    keepout: "#e85872",
    courtyard: "#a879e8",
    ...options.colors,
  }
  const order: GeometryRole[] = [
    "board",
    "copper",
    "keepout",
    "courtyard",
    "drill",
    "cutout",
  ]
  const content = [...result.elements]
    .sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))
    .map((e) => {
      const outline = e.role === "board" || e.role === "courtyard"
      const attrs = {
        fill: outline ? "none" : escape(colors[e.role]),
        stroke: outline ? escape(colors[e.role]) : "none",
        strokeWidth: e.role === "courtyard" ? 0.05 : 0.1,
        fillRule: "evenodd" as const,
      }
      return `<g data-element-id="${escape(e.elementId)}" data-layer="${escape(e.layer ?? "all")}">${e.shapes.map((shape) => shape.svg(attrs)).join("")}</g>`
    })
    .join("")
  // Display drilled voids using the drill color without changing polygon topology.
  const drillVoids = result.elements
    .filter((e) =>
      ["pcb_via", "pcb_plated_hole", "pcb_trace"].includes(e.elementType),
    )
    .flatMap((e) =>
      e.shapes.flatMap((shape) => {
        const faces = [...shape.faces]
        if (faces.length < 2) return []
        const outerOrientation = faces[0].orientation()
        return faces
          .filter((face) => face.orientation() !== outerOrientation)
          .map((face) =>
            face
              .toPolygon()
              .svg({ fill: escape(colors.drill), stroke: "none" }),
          )
      }),
    )
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${v.minX} ${-v.maxY} ${v.maxX - v.minX} ${v.maxY - v.minY}"><rect x="${v.minX}" y="${-v.maxY}" width="${v.maxX - v.minX}" height="${v.maxY - v.minY}" fill="${escape(options.background ?? "#0b1018")}"/><g transform="scale(1,-1)">${content}${drillVoids}</g></svg>`
}
