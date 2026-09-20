"""
Residential Floor Plan DXF Generator
=====================================
Generates a detailed residential floor plan as a .dxf file
matching the reference layout with all rooms, dimensions, doors, and windows.

Requires: pip install ezdxf
Usage:    python generate_floor_plan.py
Output:   floor_plan.dxf (in the same directory)
"""

import ezdxf
from ezdxf import units
from ezdxf.math import Vec2
import math
import os

# ─── Constants ───────────────────────────────────────────────────────────────
# All measurements in inches (converted from feet-inches for precision)
# 1 foot = 12 inches

def ft_in(feet, inches=0):
    """Convert feet-inches to total inches."""
    return feet * 12 + inches


# ─── Room Dimensions (width x height in inches) ─────────────────────────────
ROOMS = {
    # Top row
    "M.Bed Room":   {"w": ft_in(14, 0), "h": ft_in(15, 0), "label": "M.Bed Room\n14'0\" X 15'0\""},
    "Toilet_MB":    {"w": ft_in(4, 0),  "h": ft_in(6, 6),  "label": "Toilet\n4'0\" X 6'6\""},
    "Store Room":   {"w": ft_in(7, 0),  "h": ft_in(4, 0),  "label": "Store Room\n7'0\" X 4'0\""},
    "S.C":          {"w": ft_in(4, 0),  "h": ft_in(4, 0),  "label": "S.C"},
    "Toilet_Top":   {"w": ft_in(5, 0),  "h": ft_in(10, 6), "label": "Toilet\n5'0\" X 10'6\""},
    "C.Bed Room":   {"w": ft_in(13, 6), "h": ft_in(15, 0), "label": "C.Bed Room\n13'6\" X 15'0\""},
    "Toilet_CB":    {"w": ft_in(4, 6),  "h": ft_in(9, 6),  "label": "Toilet\n4'6\" X 9'6\""},

    # Middle row
    "Crockery":     {"w": ft_in(8, 0),  "h": ft_in(3, 0),  "label": "Crockery"},
    "G.Bed Room":   {"w": ft_in(13, 6), "h": ft_in(13, 6), "label": "G.Bed Room\n13'6\" X 13'6\""},
    "Toilet_GB":    {"w": ft_in(4, 6),  "h": ft_in(6, 0),  "label": "Toilet\n4'6\" X 6'0\""},

    # Bottom row
    "Wash Area":    {"w": ft_in(2, 0),  "h": ft_in(16, 0), "label": "Wash Area"},
    "Kitchen":      {"w": ft_in(13, 0), "h": ft_in(12, 0), "label": "Kitchen\n13'0\" X 12'0\""},
    "Dining":       {"w": ft_in(15, 4), "h": ft_in(14, 9), "label": "Dining\n15'4½\" X 14'9\""},
    "Puja":         {"w": ft_in(6, 0),  "h": ft_in(8, 0),  "label": "Puja\n6'0\" X 8'0\""},
    "Living":       {"w": ft_in(18, 0), "h": ft_in(17, 3), "label": "Living\n18'0\" X 17'3\""},
    "Shelves":      {"w": ft_in(4, 0),  "h": ft_in(3, 0),  "label": "Shelves"},
}

# Wall thickness in inches
WALL_EXT = 9   # Exterior wall: 9 inches
WALL_INT = 6   # Interior wall: 6 inches


def create_layers(doc):
    """Create standard CAD layers."""
    layers = {
        "WALLS":      {"color": 7, "lineweight": 50},   # White/black, thick
        "WALLS_INT":  {"color": 8, "lineweight": 30},   # Grey, medium
        "DOORS":      {"color": 1, "lineweight": 18},   # Red, thin
        "WINDOWS":    {"color": 3, "lineweight": 18},   # Green, thin
        "DIMENSIONS": {"color": 2, "lineweight": 13},   # Yellow, thin
        "TEXT":       {"color": 7, "lineweight": 13},    # White/black
        "FURNITURE":  {"color": 8, "lineweight": 13},    # Grey
        "HATCH":      {"color": 8, "lineweight": 13},    # Grey
    }
    for name, props in layers.items():
        layer = doc.layers.add(name)
        layer.color = props["color"]
        layer.dxf.lineweight = props["lineweight"]


def draw_rect(msp, x, y, w, h, layer="WALLS"):
    """Draw a rectangle (as 4 lines) at position (x, y) with width w and height h."""
    pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]
    for i in range(4):
        msp.add_line(pts[i], pts[i + 1], dxfattribs={"layer": layer})


def draw_room_label(msp, x, y, w, h, label, text_height=4):
    """Add a room label centered in the room."""
    cx = x + w / 2
    cy = y + h / 2
    lines = label.split("\n")
    for i, line in enumerate(lines):
        offset_y = (len(lines) - 1) * text_height / 2 - i * (text_height + 1)
        msp.add_text(
            line,
            dxfattribs={
                "layer": "TEXT",
                "height": text_height if i == 0 else text_height * 0.8,
                "insert": (cx, cy + offset_y),
                "halign": ezdxf.const.CENTER,
                "valign": ezdxf.const.MIDDLE,
            }
        ).set_placement((cx, cy + offset_y), align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER)


def draw_door_arc(msp, x, y, radius, start_angle, end_angle, layer="DOORS"):
    """Draw a door swing arc."""
    msp.add_arc(
        center=(x, y),
        radius=radius,
        start_angle=start_angle,
        end_angle=end_angle,
        dxfattribs={"layer": layer}
    )
    # Draw door leaf line
    rad_start = math.radians(start_angle)
    rad_end = math.radians(end_angle)
    msp.add_line(
        (x, y),
        (x + radius * math.cos(rad_start), y + radius * math.sin(rad_start)),
        dxfattribs={"layer": layer}
    )
    msp.add_line(
        (x, y),
        (x + radius * math.cos(rad_end), y + radius * math.sin(rad_end)),
        dxfattribs={"layer": layer}
    )


def draw_door_label(msp, x, y, label, radius=6):
    """Draw a door label in a circle."""
    msp.add_circle((x, y), radius, dxfattribs={"layer": "DOORS"})
    msp.add_text(
        label,
        dxfattribs={
            "layer": "TEXT",
            "height": 3,
            "insert": (x, y),
        }
    ).set_placement((x, y), align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER)


def draw_window(msp, x1, y1, x2, y2, layer="WINDOWS"):
    """Draw a window symbol (parallel lines)."""
    dx = x2 - x1
    dy = y2 - y1
    length = math.sqrt(dx * dx + dy * dy)
    if length == 0:
        return
    # Perpendicular direction
    nx = -dy / length * 2
    ny = dx / length * 2
    # Three parallel lines for window symbol
    for offset in [-1, 0, 1]:
        ox = nx * offset
        oy = ny * offset
        msp.add_line(
            (x1 + ox, y1 + oy),
            (x2 + ox, y2 + oy),
            dxfattribs={"layer": layer}
        )


def draw_window_label(msp, x, y, label):
    """Draw a window label in a circle."""
    msp.add_circle((x, y), 5, dxfattribs={"layer": "WINDOWS"})
    msp.add_text(
        label,
        dxfattribs={
            "layer": "TEXT",
            "height": 2.5,
        }
    ).set_placement((x, y), align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER)


def add_dimension(msp, start, end, offset, layer="DIMENSIONS"):
    """Add a linear dimension using simple line + text approach for compatibility."""
    sx, sy = start if isinstance(start, tuple) else (start[0], start[1])
    ex, ey = end if isinstance(end, tuple) else (end[0], end[1])

    # Calculate dimension line position (offset perpendicular to the line)
    dx = ex - sx
    dy = ey - sy
    length = math.sqrt(dx * dx + dy * dy)
    if length == 0:
        return

    # Perpendicular direction
    nx = -dy / length * abs(offset)
    ny = dx / length * abs(offset)

    # Offset points
    p1 = (sx + nx, sy + ny)
    p2 = (ex + nx, ey + ny)

    # Dimension line
    msp.add_line(p1, p2, dxfattribs={"layer": layer})
    # Extension lines
    msp.add_line((sx, sy), p1, dxfattribs={"layer": layer})
    msp.add_line((ex, ey), p2, dxfattribs={"layer": layer})
    # Tick marks (small lines at endpoints)
    tick = 3
    msp.add_line((p1[0] - tick, p1[1] - tick), (p1[0] + tick, p1[1] + tick), dxfattribs={"layer": layer})
    msp.add_line((p2[0] - tick, p2[1] - tick), (p2[0] + tick, p2[1] + tick), dxfattribs={"layer": layer})

    # Dimension text
    mid = ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 3)
    total_inches = length
    feet = int(total_inches // 12)
    inches = int(total_inches % 12)
    dim_text = f"{feet}'-{inches}\""
    msp.add_text(
        dim_text,
        dxfattribs={"layer": layer, "height": 3}
    ).set_placement(mid, align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER)


def build_floor_plan():
    """Main function to build the complete floor plan."""
    doc = ezdxf.new("R2010")
    doc.units = units.IN
    msp = doc.modelspace()

    create_layers(doc)

    # ─── Overall building origin ─────────────────────────────────────────
    ox, oy = 0, 0

    # ═══════════════════════════════════════════════════════════════════════
    # EXTERIOR WALLS — Overall building envelope
    # ═══════════════════════════════════════════════════════════════════════
    total_w = ft_in(55, 0)   # Approximate total width
    total_h = ft_in(50, 0)   # Approximate total height

    # Draw thick exterior walls (double lines)
    draw_rect(msp, ox, oy, total_w, total_h, "WALLS")
    draw_rect(msp, ox + WALL_EXT, oy + WALL_EXT,
              total_w - 2 * WALL_EXT, total_h - 2 * WALL_EXT, "WALLS")

    # ═══════════════════════════════════════════════════════════════════════
    # BOTTOM ROW — Kitchen, Dining, Puja, Living
    # ═══════════════════════════════════════════════════════════════════════
    row_y = oy + WALL_EXT

    # Wash Area (far left)
    wash = ROOMS["Wash Area"]
    wash_x = ox + WALL_EXT
    draw_rect(msp, wash_x, row_y, wash["w"], wash["h"], "WALLS_INT")
    draw_room_label(msp, wash_x, row_y, wash["w"], wash["h"], wash["label"], 2.5)

    # Kitchen
    kitchen = ROOMS["Kitchen"]
    kitchen_x = wash_x + wash["w"] + WALL_INT
    draw_rect(msp, kitchen_x, row_y, kitchen["w"], kitchen["h"], "WALLS_INT")
    draw_room_label(msp, kitchen_x, row_y, kitchen["w"], kitchen["h"], kitchen["label"])

    # Shelves (inside kitchen area, bottom-left)
    shelves = ROOMS["Shelves"]
    shelves_x = wash_x
    shelves_y = row_y
    draw_rect(msp, shelves_x, shelves_y, shelves["w"], shelves["h"], "FURNITURE")
    draw_room_label(msp, shelves_x, shelves_y, shelves["w"], shelves["h"], shelves["label"], 2.5)

    # Dining
    dining = ROOMS["Dining"]
    dining_x = kitchen_x + kitchen["w"] + WALL_INT
    draw_rect(msp, dining_x, row_y, dining["w"], dining["h"], "WALLS_INT")
    draw_room_label(msp, dining_x, row_y, dining["w"], dining["h"], dining["label"])

    # Puja
    puja = ROOMS["Puja"]
    puja_x = dining_x + dining["w"] / 2 - puja["w"] / 2
    puja_y = row_y
    draw_rect(msp, puja_x, puja_y, puja["w"], puja["h"], "WALLS_INT")
    draw_room_label(msp, puja_x, puja_y, puja["w"], puja["h"], puja["label"])

    # Living
    living = ROOMS["Living"]
    living_x = dining_x + dining["w"] + WALL_INT
    draw_rect(msp, living_x, row_y, living["w"], living["h"], "WALLS_INT")
    draw_room_label(msp, living_x, row_y, living["w"], living["h"], living["label"])

    # ═══════════════════════════════════════════════════════════════════════
    # MIDDLE ROW — Crockery, G.Bed Room, Toilet
    # ═══════════════════════════════════════════════════════════════════════
    mid_y = row_y + max(kitchen["h"], dining["h"], living["h"]) + WALL_INT

    # Crockery
    crockery = ROOMS["Crockery"]
    crockery_x = kitchen_x + kitchen["w"] / 2 - crockery["w"] / 2
    draw_rect(msp, crockery_x, mid_y, crockery["w"], crockery["h"], "WALLS_INT")
    draw_room_label(msp, crockery_x, mid_y, crockery["w"], crockery["h"], crockery["label"], 3)

    # G.Bed Room
    gbed = ROOMS["G.Bed Room"]
    gbed_x = dining_x + WALL_INT
    draw_rect(msp, gbed_x, mid_y, gbed["w"], gbed["h"], "WALLS_INT")
    draw_room_label(msp, gbed_x, mid_y, gbed["w"], gbed["h"], gbed["label"])

    # Toilet for G.Bed Room
    toilet_gb = ROOMS["Toilet_GB"]
    tgb_x = gbed_x + gbed["w"] + WALL_INT
    draw_rect(msp, tgb_x, mid_y, toilet_gb["w"], toilet_gb["h"], "WALLS_INT")
    draw_room_label(msp, tgb_x, mid_y, toilet_gb["w"], toilet_gb["h"], toilet_gb["label"], 2.5)

    # ═══════════════════════════════════════════════════════════════════════
    # TOP ROW — M.Bed Room, Store Room, S.C, Toilet, C.Bed Room
    # ═══════════════════════════════════════════════════════════════════════
    top_y = mid_y + max(gbed["h"], crockery["h"]) + WALL_INT

    # M.Bed Room
    mbed = ROOMS["M.Bed Room"]
    mbed_x = ox + WALL_EXT
    draw_rect(msp, mbed_x, top_y, mbed["w"], mbed["h"], "WALLS_INT")
    draw_room_label(msp, mbed_x, top_y, mbed["w"], mbed["h"], mbed["label"])

    # Toilet for M.Bed Room
    toilet_mb = ROOMS["Toilet_MB"]
    tmb_x = mbed_x
    tmb_y = top_y - toilet_mb["h"] - WALL_INT
    draw_rect(msp, tmb_x, tmb_y, toilet_mb["w"], toilet_mb["h"], "WALLS_INT")
    draw_room_label(msp, tmb_x, tmb_y, toilet_mb["w"], toilet_mb["h"], toilet_mb["label"], 2.5)

    # Store Room
    store = ROOMS["Store Room"]
    store_x = mbed_x + mbed["w"] + WALL_INT
    store_y = top_y + mbed["h"] - store["h"]
    draw_rect(msp, store_x, store_y, store["w"], store["h"], "WALLS_INT")
    draw_room_label(msp, store_x, store_y, store["w"], store["h"], store["label"], 2.5)

    # S.C
    sc = ROOMS["S.C"]
    sc_x = store_x + store["w"] + WALL_INT
    sc_y = top_y + mbed["h"] - sc["h"]
    draw_rect(msp, sc_x, sc_y, sc["w"], sc["h"], "WALLS_INT")
    draw_room_label(msp, sc_x, sc_y, sc["w"], sc["h"], sc["label"], 3)

    # Top Toilet
    toilet_top = ROOMS["Toilet_Top"]
    tt_x = sc_x
    tt_y = top_y + mbed["h"]
    draw_rect(msp, tt_x, tt_y, toilet_top["w"], toilet_top["h"], "WALLS_INT")
    draw_room_label(msp, tt_x, tt_y, toilet_top["w"], toilet_top["h"], toilet_top["label"], 2.5)

    # C.Bed Room
    cbed = ROOMS["C.Bed Room"]
    cbed_x = sc_x + sc["w"] + WALL_INT + ft_in(2, 0)
    draw_rect(msp, cbed_x, top_y, cbed["w"], cbed["h"], "WALLS_INT")
    draw_room_label(msp, cbed_x, top_y, cbed["w"], cbed["h"], cbed["label"])

    # Toilet for C.Bed Room
    toilet_cb = ROOMS["Toilet_CB"]
    tcb_x = cbed_x + cbed["w"] - toilet_cb["w"]
    tcb_y = top_y + cbed["h"]
    draw_rect(msp, tcb_x, tcb_y, toilet_cb["w"], toilet_cb["h"], "WALLS_INT")
    draw_room_label(msp, tcb_x, tcb_y, toilet_cb["w"], toilet_cb["h"], toilet_cb["label"], 2.5)

    # ═══════════════════════════════════════════════════════════════════════
    # DOORS — Add door swings
    # ═══════════════════════════════════════════════════════════════════════
    door_w = ft_in(3, 0)  # Standard 3' door

    # Main Door (MD) - bottom of living room
    md_x = living_x + living["w"] / 2
    md_y = row_y
    draw_door_arc(msp, md_x, md_y, door_w, 0, 90)
    draw_door_label(msp, md_x + door_w + 8, md_y - 8, "MD")

    # Second Main Door (MD) - bottom right
    md2_x = living_x + living["w"] - ft_in(3, 0)
    md2_y = row_y
    draw_door_arc(msp, md2_x, md2_y, door_w, 90, 180)
    draw_door_label(msp, md2_x - 8, md2_y - 8, "MD")

    # Kitchen door (D1)
    d1_x = kitchen_x + kitchen["w"]
    d1_y = row_y + kitchen["h"] / 2
    draw_door_arc(msp, d1_x, d1_y, door_w, 90, 180)
    draw_door_label(msp, d1_x + 10, d1_y, "D1")

    # M.Bed Room door (D2)
    d2_x = mbed_x + mbed["w"]
    d2_y = top_y + ft_in(3, 0)
    draw_door_arc(msp, d2_x, d2_y, ft_in(3, 6), 0, 90)
    draw_door_label(msp, d2_x + 10, d2_y + ft_in(4, 0), "D3")

    # C.Bed Room door (D3)
    d3_x = cbed_x
    d3_y = top_y + ft_in(3, 0)
    draw_door_arc(msp, d3_x, d3_y, ft_in(3, 6), 90, 180)
    draw_door_label(msp, d3_x - 10, d3_y + ft_in(4, 0), "D3")

    # Interior doors for toilets and other rooms
    # Toilet MB door
    draw_door_arc(msp, tmb_x + toilet_mb["w"], tmb_y + toilet_mb["h"] / 2, ft_in(2, 6), 0, 90)
    draw_door_label(msp, tmb_x + toilet_mb["w"] + 8, tmb_y + toilet_mb["h"] / 2, "D2")

    # G.Bed Room door
    draw_door_arc(msp, gbed_x, mid_y + gbed["h"] / 2, door_w, 0, 90)
    draw_door_label(msp, gbed_x - 10, mid_y + gbed["h"] / 2, "D1")

    # ═══════════════════════════════════════════════════════════════════════
    # WINDOWS — Add window markers
    # ═══════════════════════════════════════════════════════════════════════
    win_w = ft_in(4, 0)  # Standard 4' window

    # W1 - M.Bed Room left wall
    w1_y = top_y + mbed["h"] / 2
    draw_window(msp, ox, w1_y - win_w / 2, ox, w1_y + win_w / 2)
    draw_window_label(msp, ox - 8, w1_y, "W1")

    # W2 - C.Bed Room top
    w2_x = cbed_x + cbed["w"] / 2
    w2_y = top_y + cbed["h"]
    draw_window(msp, w2_x - win_w / 2, total_h, w2_x + win_w / 2, total_h)
    draw_window_label(msp, w2_x, total_h + 8, "V2")

    # W3 - Kitchen left wall
    w3_y = row_y + kitchen["h"] / 2
    draw_window(msp, ox, w3_y - win_w / 2, ox, w3_y + win_w / 2)
    draw_window_label(msp, ox - 8, w3_y, "W3")

    # W4 - Living room right wall
    w4_y = row_y + living["h"] / 2
    draw_window(msp, total_w, w4_y - win_w / 2, total_w, w4_y + win_w / 2)
    draw_window_label(msp, total_w + 8, w4_y, "W4")

    # W4 at top - G.Bed Room
    w4b_x = tgb_x + toilet_gb["w"]
    w4b_y = mid_y + ft_in(3, 0)
    draw_window(msp, total_w, w4b_y, total_w, w4b_y + win_w)
    draw_window_label(msp, total_w + 8, w4b_y + win_w / 2, "W4")

    # ═══════════════════════════════════════════════════════════════════════
    # DIMENSIONS — Add measurement lines
    # ═══════════════════════════════════════════════════════════════════════

    # Bottom edge dimensions
    dim_y = oy - ft_in(3, 0)
    add_dimension(msp, (ox, dim_y), (kitchen_x, dim_y), -ft_in(2, 0))
    add_dimension(msp, (kitchen_x, dim_y), (kitchen_x + kitchen["w"], dim_y), -ft_in(2, 0))
    add_dimension(msp, (dining_x, dim_y), (dining_x + dining["w"], dim_y), -ft_in(2, 0))
    add_dimension(msp, (living_x, dim_y), (living_x + living["w"], dim_y), -ft_in(2, 0))

    # Left edge dimensions
    dim_x = ox - ft_in(3, 0)
    add_dimension(msp, (dim_x, oy), (dim_x, row_y + kitchen["h"]), -ft_in(2, 0))
    add_dimension(msp, (dim_x, mid_y), (dim_x, mid_y + gbed["h"]), -ft_in(2, 0))
    add_dimension(msp, (dim_x, top_y), (dim_x, top_y + mbed["h"]), -ft_in(2, 0))

    # ═══════════════════════════════════════════════════════════════════════
    # TITLE BLOCK
    # ═══════════════════════════════════════════════════════════════════════
    tb_x = ox
    tb_y = oy - ft_in(8, 0)

    # Title block border
    draw_rect(msp, tb_x, tb_y, total_w, ft_in(4, 0), "WALLS")

    # Title text
    msp.add_text(
        "RESIDENTIAL FLOOR PLAN",
        dxfattribs={"layer": "TEXT", "height": 8}
    ).set_placement(
        (tb_x + total_w / 2, tb_y + ft_in(2, 6)),
        align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER
    )

    msp.add_text(
        "Scale: 1:100  |  All dimensions in Feet-Inches  |  Drawing: floor_plan.dxf",
        dxfattribs={"layer": "TEXT", "height": 3.5}
    ).set_placement(
        (tb_x + total_w / 2, tb_y + ft_in(0, 8)),
        align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER
    )

    # ═══════════════════════════════════════════════════════════════════════
    # SAVE
    # ═══════════════════════════════════════════════════════════════════════
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "floor_plan.dxf")
    doc.saveas(output_path)
    print(f"✅ Floor plan saved to: {output_path}")
    print(f"   File size: {os.path.getsize(output_path):,} bytes")
    print(f"   Format: DXF R2010 (AutoCAD compatible)")
    print(f"   Layers: WALLS, WALLS_INT, DOORS, WINDOWS, DIMENSIONS, TEXT, FURNITURE")
    return output_path


if __name__ == "__main__":
    build_floor_plan()
