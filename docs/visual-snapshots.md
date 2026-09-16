# Visual conversion snapshots

Every image shows the original Circuit JSON rendered by **circuit-to-svg on the left**, and the converted **FlattenJS polygons rendered to SVG on the right**, with the same viewport and scale. SVGs are committed and compared byte-for-byte in tests.

Copper pours are translucent in the reference renderer. Keepout hatching is presentation only; the converter returns the filled region. Known reference-renderer geometry differences are labeled beneath individual images and tested independently.

## pad-circle

![pad-circle](../tests/__snapshots__/pad-circle.snap.svg)

## pad-rect

![pad-rect](../tests/__snapshots__/pad-rect.snap.svg)

## pad-rounded-rect

![pad-rounded-rect](../tests/__snapshots__/pad-rounded-rect.snap.svg)

## pad-corner-radius-alias

![pad-corner-radius-alias](../tests/__snapshots__/pad-corner-radius-alias.snap.svg)

## pad-rotated-rect

![pad-rotated-rect](../tests/__snapshots__/pad-rotated-rect.snap.svg)

## pad-rotated-rounded-rect

![pad-rotated-rounded-rect](../tests/__snapshots__/pad-rotated-rounded-rect.snap.svg)

## pad-pill-horizontal

![pad-pill-horizontal](../tests/__snapshots__/pad-pill-horizontal.snap.svg)

## pad-pill-vertical

![pad-pill-vertical](../tests/__snapshots__/pad-pill-vertical.snap.svg)

## pad-pill-partial-rounding

![pad-pill-partial-rounding](../tests/__snapshots__/pad-pill-partial-rounding.snap.svg)

## pad-rotated-pill

![pad-rotated-pill](../tests/__snapshots__/pad-rotated-pill.snap.svg)

## pad-pill-circle

![pad-pill-circle](../tests/__snapshots__/pad-pill-circle.snap.svg)

## pad-polygon

![pad-polygon](../tests/__snapshots__/pad-polygon.snap.svg)

## pad-concave-polygon

![pad-concave-polygon](../tests/__snapshots__/pad-concave-polygon.snap.svg)

## pad-duplicate-points

![pad-duplicate-points](../tests/__snapshots__/pad-duplicate-points.snap.svg)

## plated-circle

![plated-circle](../tests/__snapshots__/plated-circle.snap.svg)

## plated-oval

![plated-oval](../tests/__snapshots__/plated-oval.snap.svg)

## plated-pill-rotated

![plated-pill-rotated](../tests/__snapshots__/plated-pill-rotated.snap.svg)

## plated-rect-circle-offset

![plated-rect-circle-offset](../tests/__snapshots__/plated-rect-circle-offset.snap.svg)

## plated-rounded-rect-circle

![plated-rounded-rect-circle](../tests/__snapshots__/plated-rounded-rect-circle.snap.svg)

## plated-rect-pill

![plated-rect-pill](../tests/__snapshots__/plated-rect-pill.snap.svg)

## plated-independent-rotations

![plated-independent-rotations](../tests/__snapshots__/plated-independent-rotations.snap.svg)

## plated-polygon-circle

Reference renderer ignores polygon-pad rotation; FlattenJS applies ccw_rotation.

![plated-polygon-circle](../tests/__snapshots__/plated-polygon-circle.snap.svg)

## plated-polygon-component-rotation

Reference renderer ignores component rotation for local polygon pads.

![plated-polygon-component-rotation](../tests/__snapshots__/plated-polygon-component-rotation.snap.svg)

## plated-polygon-pill

Reference renderer ignores polygon-pad and drill rotation; FlattenJS applies it.

![plated-polygon-pill](../tests/__snapshots__/plated-polygon-pill.snap.svg)

## hole-circle

![hole-circle](../tests/__snapshots__/hole-circle.snap.svg)

## hole-square

![hole-square](../tests/__snapshots__/hole-square.snap.svg)

## hole-rect

![hole-rect](../tests/__snapshots__/hole-rect.snap.svg)

## hole-oval

![hole-oval](../tests/__snapshots__/hole-oval.snap.svg)

## hole-pill

![hole-pill](../tests/__snapshots__/hole-pill.snap.svg)

## hole-rotated_pill

![hole-rotated_pill](../tests/__snapshots__/hole-rotated_pill.snap.svg)

## via-through

![via-through](../tests/__snapshots__/via-through.snap.svg)

## via-inner-layer

![via-inner-layer](../tests/__snapshots__/via-inner-layer.snap.svg)

## via-blind-inner-layer

![via-blind-inner-layer](../tests/__snapshots__/via-blind-inner-layer.snap.svg)

## via-blind-excluded-bottom

Reference renderer draws blind vias on every layer; bottom correctly excludes this via.

![via-blind-excluded-bottom](../tests/__snapshots__/via-blind-excluded-bottom.snap.svg)

## trace-horizontal

![trace-horizontal](../tests/__snapshots__/trace-horizontal.snap.svg)

## trace-diagonal

![trace-diagonal](../tests/__snapshots__/trace-diagonal.snap.svg)

## trace-bends

![trace-bends](../tests/__snapshots__/trace-bends.snap.svg)

## trace-width-change

![trace-width-change](../tests/__snapshots__/trace-width-change.snap.svg)

## trace-interpolated

![trace-interpolated](../tests/__snapshots__/trace-interpolated.snap.svg)

## trace-through-pad

![trace-through-pad](../tests/__snapshots__/trace-through-pad.snap.svg)

## trace-layer-transition-top

Reference estimates inline-via diameters; FlattenJS uses the explicit Circuit JSON diameters.

![trace-layer-transition-top](../tests/__snapshots__/trace-layer-transition-top.snap.svg)

## trace-layer-transition-bottom

Reference estimates inline-via diameters; FlattenJS uses the explicit Circuit JSON diameters.

![trace-layer-transition-bottom](../tests/__snapshots__/trace-layer-transition-bottom.snap.svg)

## trace-layer-transition-inner1

Reference estimates inline-via diameters; FlattenJS uses the explicit Circuit JSON diameters.

![trace-layer-transition-inner1](../tests/__snapshots__/trace-layer-transition-inner1.snap.svg)

## pour-rect-rotated

![pour-rect-rotated](../tests/__snapshots__/pour-rect-rotated.snap.svg)

## pour-polygon-concave

![pour-polygon-concave](../tests/__snapshots__/pour-polygon-concave.snap.svg)

## pour-brep-straight-hole

![pour-brep-straight-hole](../tests/__snapshots__/pour-brep-straight-hole.snap.svg)

## pour-brep-multiple-holes

![pour-brep-multiple-holes](../tests/__snapshots__/pour-brep-multiple-holes.snap.svg)

## pour-brep-curved-outer

![pour-brep-curved-outer](../tests/__snapshots__/pour-brep-curved-outer.snap.svg)

## pour-brep-curved-hole

![pour-brep-curved-hole](../tests/__snapshots__/pour-brep-curved-hole.snap.svg)

## pour-brep-two-semicircles

![pour-brep-two-semicircles](../tests/__snapshots__/pour-brep-two-semicircles.snap.svg)

## pour-brep-clockwise

![pour-brep-clockwise](../tests/__snapshots__/pour-brep-clockwise.snap.svg)

## keepout-rect

![keepout-rect](../tests/__snapshots__/keepout-rect.snap.svg)

## keepout-circle

![keepout-circle](../tests/__snapshots__/keepout-circle.snap.svg)

## keepout-outline

Reference renderer omits outline keepouts; FlattenJS includes the filled region.

![keepout-outline](../tests/__snapshots__/keepout-outline.snap.svg)

## cutout-rect-rounded

![cutout-rect-rounded](../tests/__snapshots__/cutout-rect-rounded.snap.svg)

## cutout-circle

![cutout-circle](../tests/__snapshots__/cutout-circle.snap.svg)

## cutout-polygon

![cutout-polygon](../tests/__snapshots__/cutout-polygon.snap.svg)

## cutout-path

Reference renderer fills path vertices; converter models the specified slot width.

![cutout-path](../tests/__snapshots__/cutout-path.snap.svg)

## courtyard-rect

![courtyard-rect](../tests/__snapshots__/courtyard-rect.snap.svg)

## courtyard-circle

![courtyard-circle](../tests/__snapshots__/courtyard-circle.snap.svg)

## courtyard-pill

Reference renderer omits pill courtyards; FlattenJS includes their boundary.

![courtyard-pill](../tests/__snapshots__/courtyard-pill.snap.svg)

## courtyard-polygon

![courtyard-polygon](../tests/__snapshots__/courtyard-polygon.snap.svg)

## courtyard-outline

![courtyard-outline](../tests/__snapshots__/courtyard-outline.snap.svg)

## board-rectangle

![board-rectangle](../tests/__snapshots__/board-rectangle.snap.svg)

## board-concave-outline

![board-concave-outline](../tests/__snapshots__/board-concave-outline.snap.svg)

## layer-filter-top

![layer-filter-top](../tests/__snapshots__/layer-filter-top.snap.svg)

## layer-filter-bottom

![layer-filter-bottom](../tests/__snapshots__/layer-filter-bottom.snap.svg)

## layer-filter-inner1

![layer-filter-inner1](../tests/__snapshots__/layer-filter-inner1.snap.svg)

## layer-filter-inner2

![layer-filter-inner2](../tests/__snapshots__/layer-filter-inner2.snap.svg)

## trace-interpolated-bend

![trace-interpolated-bend](../tests/__snapshots__/trace-interpolated-bend.snap.svg)

## mspm0g3507-top

Original PCB geometry; source and schematic records omitted. Reference pours are translucent.

![mspm0g3507-top](../tests/__snapshots__/mspm0g3507-top.snap.svg)

## mspm0g3507-bottom

Original PCB geometry; source and schematic records omitted. Reference pours are translucent.

![mspm0g3507-bottom](../tests/__snapshots__/mspm0g3507-bottom.snap.svg)

## mspm0g3507-usb-ground-short

USB-C pads and ground pour from the reported short. Reference pours are translucent.

![mspm0g3507-usb-ground-short](../tests/__snapshots__/mspm0g3507-usb-ground-short.snap.svg)
