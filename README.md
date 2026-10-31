# Aurra Green — interactive building website

Marketing website for **Aurra Green**, 3 BHK exclusive living at Vasna, Ahmedabad (one 6-storey tower, 12 flats).

## Features
- Full-screen hero, project facts, gallery, amenities, specifications, location and enquiry (WhatsApp) sections
- **Choose your floor**: hover a floor on the tower render to see availability; click to go inside
- **Live 3D walkthrough** (Three.js r160): clicking a floor zooms into the tower, the camera approaches the building from the street, lands on the flat's balcony and glides through the glass door into the hall
- In-scene room tags and a room bar: clicking a room walks the camera there through the actual doorways
- Furnished, textured interiors (wood/marble floors, tiled bathrooms, kitchen, wardrobes, sofas, art, plants, curtains), golden-hour sunlight, surrounding city; dollhouse view; switch between the two flats on a floor
- Optional 2D floor plan view, plus ground floor and terrace plans

## Run locally
It is a static site. Serve the folder over HTTP (the 3D view loads textures, so `file://` will not work):

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Editing data
At the top of the main `<script>` in `index.html`:
- `STATUS` — availability per flat (`available` | `booked` | `sold`). **Currently sample data — replace with real availability.**
- `FLOOR_COPY`, `ROOMS`, `SPECIAL`, `AMENITIES`, `SPECS` — text and room sizes
- `PROJECT.phone` — WhatsApp number for enquiries

3D geometry lives in `live3d.js` (ES module; three.js is loaded from jsDelivr via the import map in `index.html`). Walls, doors and windows are traced in % coordinates of `img/typical3d.webp` (`WALLS_A`); furniture is in `furnish()`; camera viewpoints in `ROOMS3D`; walking routes in `NODES`/`EDGES`.

## Before going live
- Add the Gujarat RERA registration number (footer shows a placeholder)
- Replace images with high-resolution originals from the architect
- Confirm wing naming (West/East) and prices
EOF
