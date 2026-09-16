import { visualCases } from "../tests/fixtures/cases"
const intro = `# Visual conversion snapshots\n\nEvery image shows the original Circuit JSON rendered by **circuit-to-svg on the left**, and the converted **FlattenJS polygons rendered to SVG on the right**, with the same viewport and scale. SVGs are committed and compared byte-for-byte in tests.\n\nCopper pours are translucent in the reference renderer. Keepout hatching is presentation only; the converter returns the filled region. Known reference-renderer geometry differences are labeled beneath individual images and tested independently.\n\n`
await Bun.write(
  new URL("../docs/visual-snapshots.md", import.meta.url),
  intro +
    visualCases
      .map(
        (f) =>
          `## ${f.name}\n\n${f.note ? `${f.note}\n\n` : ""}![${f.name}](../tests/__snapshots__/${f.name}.snap.svg)\n`,
      )
      .join("\n"),
)
