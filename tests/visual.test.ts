import { expect, test } from "bun:test"
import { join } from "node:path"
import { visualCases } from "./fixtures/cases"
import { renderComparison } from "./comparison"

for (const fixture of visualCases) {
  test(`visual: ${fixture.name}`, async () => {
    const svg = renderComparison(fixture)
    const path = join(
      import.meta.dir,
      "__snapshots__",
      `${fixture.name}.snap.svg`,
    )
    if (process.env.UPDATE_SNAPSHOTS === "1") await Bun.write(path, svg)
    const file = Bun.file(path)
    expect(await file.exists()).toBe(true)
    expect(svg).toBe(await file.text())
    expect(svg).not.toContain("NaN")
    expect(svg).not.toContain("Infinity")
  })
}
