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
