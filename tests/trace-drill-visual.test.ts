import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import { convertCircuitJsonToFlattenJs, renderFlattenJsToSvg } from "../index"
import { trace } from "./fixtures/tiny-trace-near-drill"

const viewport = { minX: -5.42, minY: 0.63, maxX: -4.83, maxY: 1.2 }
const render = (includeDrillHoles: boolean) =>
  renderFlattenJsToSvg(
    convertCircuitJsonToFlattenJs([trace], {
      strict: true,
      layer: "bottom",
      includeDrillHoles,
    }),
    { width: 460, height: 400, viewport },
  )
const embed = (svg: string, x: number) =>
  svg.replace("<svg ", `<svg x="${x}" y="95" `)

// Capture the exception rather than suppressing it: the baseline must show why
// DRC had no geometry, not imply that the missing copper was a valid result.
test("visual: tiny trace and embedded via drill", async () => {
  const input = render(false)
  let result: string
  let status: string
  try {
    result = embed(render(true), 520)
    status =
      "Conversion completed. Via drill is removed; surrounding copper remains."
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("Unresolved boundary conflict")
    )
      throw error
    result = `<rect x="520" y="95" width="460" height="400" fill="#0b1018"/><g fill="#ff9d9d" font-family="sans-serif" font-size="18"><text x="550" y="260">Conversion failed</text><text x="550" y="294" font-size="14">Unresolved boundary conflict</text><text x="550" y="318" font-size="14">in boolean operation</text></g>`
    status =
      "DRC cannot validate this trace: geometry conversion threw an exception."
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="570" viewBox="0 0 1000 570">
<rect width="1000" height="570" fill="#111924"/>
<g fill="#e6edf3" font-family="sans-serif"><text x="20" y="32" font-size="22">Tiny trace segment near an embedded via drill</text><text x="20" y="59" font-size="14">Bottom copper · PCB coordinates in mm · identical viewport on both sides</text><text x="20" y="83" font-size="15">Input copper envelope (before drilling)</text><text x="520" y="83" font-size="15">Converted copper (after drilling)</text></g>
${embed(input, 20)}${result}
<g fill="#b0bdcc" font-family="sans-serif" font-size="14"><text x="20" y="524">${status}</text><text x="20" y="550">Via: 0.45 mm pad / 0.20 mm drill. The 1.7 nm segment is too small to see at this scale.</text></g>
</svg>\n`
  const path = `${import.meta.dir}/__snapshots__/trace-drill-boundary-precision.snap.svg`
  if (process.env.UPDATE_SNAPSHOTS === "1") {
    await Bun.write(path, svg)
    await Bun.write(
      path.replace(".svg", ".png"),
      new Resvg(svg).render().asPng(),
    )
  }
  expect(svg).toBe(await Bun.file(path).text())
})
