import { Vector, type Polygon } from "@flatten-js/core"
import type { PcbPlatedHole, PcbSmtPad, PcbHole } from "circuit-json"
import { circle, ellipse, rectangle, ring, withHoles } from "./geometry"

export function smtPad(pad: PcbSmtPad): Polygon {
  switch (pad.shape) {
    case "circle":
      return circle(pad, pad.radius)
    case "polygon":
      return ring(pad.points)
    case "rect":
    case "rotated_rect":
      return rectangle(
        pad,
        pad.width,
        pad.height,
        "ccw_rotation" in pad ? pad.ccw_rotation : 0,
        pad.rect_border_radius ?? pad.corner_radius ?? 0,
      )
    case "pill":
    case "rotated_pill":
      return rectangle(
        pad,
        pad.width,
        pad.height,
        "ccw_rotation" in pad ? pad.ccw_rotation : 0,
        pad.radius,
      )
  }
}

export function nonPlatedHole(hole: PcbHole, tolerance: number): Polygon {
  switch (hole.hole_shape) {
    case "circle":
      return circle(hole, hole.hole_diameter / 2)
    case "square":
      return rectangle(hole, hole.hole_diameter, hole.hole_diameter)
    case "rect":
      return rectangle(hole, hole.hole_width, hole.hole_height)
    case "oval":
      return ellipse(hole, hole.hole_width, hole.hole_height, 0, tolerance)
    case "pill":
    case "rotated_pill":
      return rectangle(
        hole,
        hole.hole_width,
        hole.hole_height,
        "ccw_rotation" in hole ? hole.ccw_rotation : 0,
        Math.min(hole.hole_width, hole.hole_height) / 2,
      )
  }
}

export function platedHole(
  hole: PcbPlatedHole,
  componentRotation: number,
  includeDrill: boolean,
  tolerance: number,
): Polygon {
  let outer: Polygon
  let drill: Polygon
  const drillCenter = {
    x: hole.x + ("hole_offset_x" in hole ? (hole.hole_offset_x ?? 0) : 0),
    y: hole.y + ("hole_offset_y" in hole ? (hole.hole_offset_y ?? 0) : 0),
  }
  switch (hole.shape) {
    case "circle":
      outer = circle(hole, hole.outer_diameter / 2)
      drill = circle(hole, hole.hole_diameter / 2)
      break
    case "oval":
      outer = ellipse(
        hole,
        hole.outer_width,
        hole.outer_height,
        hole.ccw_rotation,
        tolerance,
      )
      drill = ellipse(
        hole,
        hole.hole_width,
        hole.hole_height,
        hole.ccw_rotation,
        tolerance,
      )
      break
    case "pill":
      outer = rectangle(
        hole,
        hole.outer_width,
        hole.outer_height,
        hole.ccw_rotation,
        Math.min(hole.outer_width, hole.outer_height) / 2,
      )
      drill = rectangle(
        hole,
        hole.hole_width,
        hole.hole_height,
        hole.ccw_rotation,
        Math.min(hole.hole_width, hole.hole_height) / 2,
      )
      break
    case "circular_hole_with_rect_pad":
    case "pill_hole_with_rect_pad":
    case "rotated_pill_hole_with_rect_pad":
      outer = rectangle(
        hole,
        hole.rect_pad_width,
        hole.rect_pad_height,
        "rect_ccw_rotation" in hole ? hole.rect_ccw_rotation : 0,
        hole.rect_border_radius ?? 0,
      )
      drill =
        hole.shape === "circular_hole_with_rect_pad"
          ? circle(drillCenter, hole.hole_diameter / 2)
          : rectangle(
              drillCenter,
              hole.hole_width,
              hole.hole_height,
              "hole_ccw_rotation" in hole ? hole.hole_ccw_rotation : 0,
              Math.min(hole.hole_width, hole.hole_height) / 2,
            )
      break
    case "hole_with_polygon_pad": {
      const rotation = hole.ccw_rotation ?? componentRotation
      outer = ring(hole.pad_outline)
        .rotate((rotation * Math.PI) / 180)
        .translate(new Vector(hole.x, hole.y))
      drill =
        hole.hole_shape === "circle"
          ? circle(drillCenter, hole.hole_diameter! / 2)
          : hole.hole_shape === "oval"
            ? ellipse(
                drillCenter,
                hole.hole_width!,
                hole.hole_height!,
                rotation,
                tolerance,
              )
            : rectangle(
                drillCenter,
                hole.hole_width!,
                hole.hole_height!,
                rotation,
                Math.min(hole.hole_width!, hole.hole_height!) / 2,
              )
      break
    }
  }
  return includeDrill ? withHoles(outer, [drill]) : outer
}
