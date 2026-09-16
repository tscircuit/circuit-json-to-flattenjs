import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { convertCircuitJsonToFlattenJs, renderFlattenJsToSvg } from "../index"
import type { VisualCase } from "./fixtures/cases"

export function renderComparison(fixture: VisualCase): string {
  const converted = convertCircuitJsonToFlattenJs(fixture.circuitJson, {
    ...fixture.options,
    strict: true,
  })
  if (converted.warnings.length)
    throw new Error(JSON.stringify(converted.warnings))
  const box = converted.bounds
  const viewport = fixture.viewport ?? {
    minX: (box?.xmin ?? -7) - 0.5,
    minY: (box?.ymin ?? -5) - 0.5,
    maxX: (box?.xmax ?? 7) + 0.5,
    maxY: (box?.ymax ?? 5) + 0.5,
  }
  const copper = Object.fromEntries(
    [
      "top",
      "bottom",
      ...Array.from({ length: 8 }, (_, i) => `inner${i + 1}`),
    ].map((layer) => [layer, "#c87828"]),
  )
  const left = convertCircuitJsonToPcbSvg(fixture.circuitJson, {
    width: 490,
    height: 350,
    viewport,
    includeVersion: false,
    layer: fixture.options?.layer,
    shouldDrawErrors: false,
    shouldDrawWarnings: false,
    shouldDrawRatsNest: false,
    showSolderMask: false,
    showSolderPaste: false,
    showPinNumbers: false,
    showPcbNotes: false,
    showCourtyards: true,
    backgroundColor: "#0b1018",
    colorOverrides: {
      copper,
      drill: "#38515f",
      boardOutline: "#59726b",
      courtyard: { top: "#a879e8", bottom: "#a879e8" },
      keepout: "#e85872",
    },
  })
  const right = renderFlattenJsToSvg(converted, {
    width: 490,
    height: 350,
    viewport,
    colors: { drill: "#38515f", cutout: "#38515f" },
  })
  const escape = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  // Prefix reference IDs so multiple snapshots can be safely embedded in a gallery.
  const prefix = fixture.name + "-"
  // Reference-renderer coordinates also contain platform-dependent final bits.
  // Normalize numeric geometry attributes only; preserve text, IDs and font data.
  const stableLeft = left.replace(
    /\b(d|points|transform|viewBox|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|width|height|stroke-width)="([^"]*)"/g,
    (_, attr, value) =>
      `${attr}="${value.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (n: string) => String(Number(Number(n).toFixed(8))))}"`,
  )
  const prefixed = stableLeft
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`)
  const embed = (svg: string, x: number) =>
    svg.replace(/<svg\b/, `<svg x="${x}" y="76"`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="470" viewBox="0 0 1020 470">
<rect width="1020" height="470" fill="#111924"/>
<g fill="#e6edf3" font-family="sans-serif"><text x="20" y="28" font-size="18">${escape(fixture.name)} · ${fixture.options?.layer ?? "all layers"}</text><text x="20" y="60" font-size="14">Circuit JSON → circuit-to-svg</text><text x="530" y="60" font-size="14">Circuit JSON → FlattenJS → SVG</text></g>
${embed(prefixed, 10)}${embed(right, 520)}
<text x="20" y="452" fill="#b0bdcc" font-family="sans-serif" font-size="12">${escape(fixture.note ?? "Same coordinates and viewport. Circular arcs and cutouts are preserved.")}</text>
</svg>\n`
}
