# Build log

Date: 2026-10-22. Stack: Next.js 16.4 (App Router, Turbopack) + Tailwind 4, local JSON data driver.
Verified in the browser at 375 px and 1440 px; all 14 user-facing routes render without horizontal overflow; `next build` passes; `tsc` clean.

| ID | screen | status | missing / notes |
| --- | --- | --- | --- |
| S01 | App-install interstitial | skipped | We are the web app. PWA manifest instead. |
| S02 | Location prompt | done | |
| S03 | Location search sheet | done | OpenStreetMap Nominatim via cached server proxy (1 req/s). GPS + reverse geocode. |
| S04 | Home | done | Banners, 4 category groups, shop-by-store, 4 product rails, not-serviceable and store-closed banners. |
| S05 | Category listing | done | Sticky sub-category rail, sort chips, sold-out items sink. |
| S06 | Search | done | Suggestions with highlight, typo tolerance ("panner" finds paneer), recent + popular, empty state. |
| S07 | Product detail | partial | One art tile, no image carousel (no product photos yet). |
| S08 | Variant sheet | done | |
| S09 | Floating cart pill | done | Moves above the PDP buy bar. |
| S10 | Cart | done | Server re-pricing, stock caps, free-delivery progress, share link, suggestions, empty state. |
| S11/S12 | Login + OTP | partial | Works end to end; SMS provider not connected, so the code shows on screen in demo mode. |
| S13 | Checkout | done | Address picker, instructions, tip, coupons, payment methods, idempotent place-order. |
| S14 | Add address | done | Leaflet map with draggable pin. Map needed a resize fix inside the animated sheet. |
| S15 | Live tracking | done | Status timeline, moving rider marker, delivery code, call rider, cancel, help, rate, order again. |
| S16 | Orders list | done | |
| S17 | Order detail / invoice | partial | Detail is on the tracking page; no PDF invoice. |
| S18 | Help on order | done | Photo upload (resized client-side), instant wallet refund, complaint windows, duplicate guard. |
| S19 | Account | done | Profile, addresses, wallet, logout, staff link. |
| S20 | Static pages | done | Own FAQ copy at /help. |
| — | Store dashboard | partial | Kanban order board + per-store stock editor. No catalogue CRUD. |

Harder than expected:
- Hydration: the cart lives in localStorage, so checkout briefly saw an empty cart and bounced to /cart. Fixed with a ready flag.
- The delivery-complete API accepted a missing OTP. Now the code is required.
- A sold-out item reported "cart empty" instead of "cart changed". Fixed order of checks.

Not done yet (needs keys or a decision from you):
- Real SMS OTP (MSG91/Twilio), Razorpay for UPI/cards, Supabase driver for production data (schema is ready in replica/schema.sql).
- Saved screenshots in replica/clone-screens/ for replica-diff (Playwright isn't installed on this machine).

## 2026-10-22: design matched to the original (user request)

The user asked for the design to look the same as Blinkit. Measured their public mobile web with computed styles and rebuilt the tokens and components to match:
- Colours: green `#0c831f` CTA and cart bar, ADD outline `#318616` on `#f7fff9`, blue discount flag, yellow `#f8cb46` brand, `#e5f3f3` category tiles, `#f8f8f8` search box, `#f4f6fb` cart background.
- Type: Okra is paid, so Figtree stands in. Sizes match (18/800 header, 17/800 sections, 13/600 names and prices, 9/700 ETA chip).
- Components: zig-zag discount flag, image-only border on rail cards, "N options" inside ADD, green unit picker, anchored location popover with GPS-first button, centred "My Cart" header, blue savings strip, green total bar, OTP boxes, product-wall login.
- Product art: Fluent Emoji 3D renders (MIT) on white instead of emoji glyphs.
- Kept our own: name, logo, taglines and marketing copy, product images. Contrast still passes AA (tokens.json, 18 pairs).

## 2026-10-22: admin panel

Built `/admin` with a sidebar shell: Dashboard (KPIs, 7-day orders chart, live orders, low stock), Live board, Orders (filters, detail, advance, cancel & refund), Products (create/edit/hide with sizes, prices, stock, image picker), Categories (add/edit/reorder/hide, sub-categories), Inventory (per store), Stores (pause, hours, radius), Customers (wallet credit/debit, admin role), Coupons (CRUD with caps, expiry, first-order), Complaints (refund/reject), Reports (14 days), Fees & settings.

To make this possible the catalogue, coupons, fees and store settings moved from code into the database (seeded from the demo data on first run). Admin mutations are server actions that check the admin role on every call.

Verified in the browser: new product appears in store, search, category and cart pricing; hiding it 404s the product page; pausing a store closes ordering; fee changes reprice carts; a new coupon applies with its cap; complaint refund credits the wallet; new sub-category shows in the store rail; an admin can't remove their own access. All admin pages render at 375 and 1280 px without overflow.

Harder than expected: the dev server kept an old in-memory database object without the new fields, so the first store update silently failed. The loader now backfills missing fields.

## 2026-10-22: rider app

`/rider` mobile web app with its own manifest: duty toggle, GPS every 5 s, order offers with pay/distance/cash, accept (atomic, one active job), slide-to-confirm steps (also Enter key), item checklist at pickup, Google Maps navigation links, OTP + cash confirmation, success screen, earnings (today, 7 days, trips, cash to hand over), profile. Admin → Riders: add/remove riders, assign store, force off duty, live status, trips, earnings, cash held.

Order model: new "rider" mode. If a rider is on duty at the store, auto orders hold at "packed" until accepted; the customer sees "Finding a delivery partner", then the rider's real name, stage and GPS position with a distance-based ETA.

Verified end to end with two separate sessions (customer on localhost, rider on 127.0.0.1): offer appears, accept, early pickup refused while packing, pickup after packing, live location on customer map, can't go offline mid-delivery, wrong OTP refused, COD needs cash confirmation, delivered, ₹57 pay including ₹30 tip, earnings and admin numbers match. Without riders on duty, demo auto mode still works.

Found while testing: the `rounded-pill` radius token was never defined, so every pill-shaped chip in the app rendered square. Fixed in globals.css.

## 2026-10-22: pastel blue theme (user request)

Swapped the palette in tokens.json and globals.css: page `#f2f7ff`, tiles `#e1efff`, search `#f5f9ff`, buttons and cart bar `#2f6fd1`, ADD `#2a64c2` on `#eef5ff`, logo tile `#bcdcff` with navy text, discount flags violet `#6a4bd4`, navy text `#17233a`. All 23 text/background pairs pass WCAG AA. Replaced every hard-coded green/yellow/grey in components with tokens (new `warn-soft`, `switch-off`), and moved storefront and banner tints, map pins, app icons and both manifests to the blue family. Layout is unchanged.
