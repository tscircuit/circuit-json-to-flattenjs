import type { AnyCircuitElement, LayerRef } from "circuit-json"
import type { ConversionOptions } from "./types"

export function getCopperLayers(
  json: readonly AnyCircuitElement[],
  options: ConversionOptions,
): LayerRef[] {
  if (options.copperLayers) {
    if (
      !options.copperLayers.length ||
      new Set(options.copperLayers).size !== options.copperLayers.length
    )
      throw new Error(
        "copperLayers must be a non-empty list without duplicates",
      )
    return [...options.copperLayers]
  }
  const board = json.find((e) => e.type === "pcb_board")
  let count = board?.num_layers ?? 2
  for (const element of json) {
    const layers =
      "layers" in element
        ? element.layers
        : "layer" in element
          ? [element.layer]
          : []
    if (Array.isArray(layers))
      for (const layer of layers) {
        const match = typeof layer === "string" && /^inner(\d+)$/.exec(layer)
        if (match) count = Math.max(count, Number(match[1]) + 2)
      }
    if (element.type === "pcb_trace")
      for (const p of element.route) {
        for (const layer of p.route_type === "wire"
          ? [p.layer]
          : p.route_type === "via"
            ? [p.from_layer, p.to_layer]
            : [p.start_layer, p.end_layer]) {
          const match = /^inner(\d+)$/.exec(layer)
          if (match) count = Math.max(count, Number(match[1]) + 2)
        }
      }
  }
  if (!Number.isInteger(count) || count < 1 || count > 10)
    throw new Error("Supported copper layer count is 1–10")
  return count === 1
    ? ["top"]
    : [
        "top",
        ...Array.from(
          { length: count - 2 },
          (_, i) => `inner${i + 1}` as LayerRef,
        ),
        "bottom",
      ]
}

/** Through copper spans the physical stack between its outermost named layers. */
export function spanLayers(
  layers: readonly string[],
  stack: readonly LayerRef[],
): string[] {
  if (!layers.length) return []
  const indices = layers.map((layer) => stack.indexOf(layer as LayerRef))
  if (indices.some((i) => i < 0))
    throw new Error(`Layer is missing from copperLayers: ${layers.join(", ")}`)
  return stack.slice(Math.min(...indices), Math.max(...indices) + 1)
}
