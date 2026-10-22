# Architecture: DoorPe (a rebuild of Blinkit's core features)

Name "DoorPe". replica-brand can rename it later; every brand string lives in `lib/brand.ts`.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | Next.js 16 App Router + TypeScript, mobile-first PWA | same stack as the user's other project (gameplaydrive), server components keep the catalogue fast |
| styling | Tailwind 4 with CSS-variable tokens from replica-design | already used in gameplaydrive; tokens make the rebrand a one-file change |
| database | Postgres on Supabase (+ PostGIS for store radius) | user already runs Supabase; geo queries are built in |
| data layer | `lib/db/` repository with two drivers: `local` (JSON file, zero setup, default) and `supabase` | app runs on `npm run dev` with no keys; flip `DATA_DRIVER=supabase` for production |
| auth | phone + OTP. Local driver: OTP printed in server log / dev hint. Prod: Supabase phone auth with MSG91 or Twilio | Blinkit is phone-only; Supabase supports it natively |
| payments | Razorpay (UPI, cards, netbanking, wallets) + Cash on Delivery | India-first; Stripe has weak UPI/COD. Local driver simulates a successful UPI payment |
| maps | Leaflet + OpenStreetMap tiles; geocoding via a server proxy to Nominatim (cached, 1 req/s) | no API key needed; swap for Google Places later for better Indian address search |
| realtime | Local: client polls `/api/orders/:id` every 3 s. Prod: Supabase Realtime on `orders` and `rider_locations` | tracking must feel live |
| jobs | none in local (order status is derived from timestamps); prod: Supabase cron for stale-order cleanup | fewer moving parts |
| files | Supabase Storage (issue photos, product images) | same project |
| hosting | Netlify (Next runtime) | user deploys gameplaydrive there already |

One database, one app. Admin and rider screens are routes inside the same Next app (`/admin`, `/rider`), gated by role.

## Schema

Tables: 17. Access rules: Postgres RLS (catalogue public-read, customer rows owner-only); orders written only by server routes with the service key so prices are always recomputed server-side. Full SQL: `replica/schema.sql`.

Hard constraints found in recon:
- Stock never negative: single conditional `update … where stock >= qty`, raise if not found (inside the place-order transaction).
- Address snapshot on the order (FAQ: address cannot change after placing).
- Cancel only while `status in ('placed','packing')` — enforced in the route and in a check on transition.
- Idempotent place-order: `orders.idempotency_key unique` (double-tap on Pay creates one order).
- One default address per user: partial unique index.

## API

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| GET /api/geo/search?q= | address autocomplete (proxied, cached) | anyone | q | [{label, sub, lat, lng}] | F01 |
| GET /api/geo/reverse?lat&lng | reverse geocode GPS | anyone | lat,lng | {label, sub} | F01 |
| GET /api/serviceability?lat&lng | nearest store + ETA | anyone | lat,lng | {store, eta} or {serviceable:false} | F01 |
| (RSC) / | home sections, rails | anyone | location cookie | page | F01 |
| (RSC) /cn/[slug] | category listing w/ sub-rail | anyone | slug, ?sub= | page | F02 |
| (RSC) /p/[slug] | product detail | anyone | slug | page | F04 |
| GET /api/search?q= | suggestions + results | anyone | q | {suggestions, products} | F03 |
| POST /api/cart/quote | price a cart for the current store (fees, savings, stock) | anyone | items[], coupon? | Quote | F05/F06 |
| POST /api/auth/otp | send OTP | anyone (rate limited 3/10 min/phone) | phone | {ok, devOtp?} | F05 |
| POST /api/auth/verify | verify OTP, set session cookie | anyone | phone, otp | {user} | F05 |
| POST /api/auth/logout | clear session | user | — | — | — |
| GET/PATCH /api/me | profile | user | name,email | profile | S19 |
| GET/POST/PATCH/DELETE /api/addresses | saved addresses | user (own) | address | address[] | F06 |
| POST /api/orders | place order (re-quote, decrement stock, create payment) | user | items, addressId, payment, tip, coupon, idempotencyKey | {order, razorpay?} | F06 |
| POST /api/payments/razorpay/verify | verify signature, mark paid | user | ids, signature | {order} | F06 |
| GET /api/orders | my orders | user | — | Order[] | F08 |
| GET /api/orders/[id] | order + live status + rider position | owner, staff | — | OrderLive | F07 |
| POST /api/orders/[id]/cancel | cancel if not packed; refund | owner | reason | order | F07 |
| POST /api/orders/[id]/issues | raise issue (photo) | owner | kind, itemId, note, photo | issue | F08 |
| GET /api/admin/orders | live order board | admin/store | status | Order[] | ops |
| POST /api/admin/orders/[id]/advance | packing → packed → out_for_delivery (assign rider) → delivered (OTP) | admin/store/rider | otp? | order | ops |
| PATCH /api/admin/inventory | price/stock edit | admin/store | storeId, variantId, price, stock | row | ops |

Webhooks in: Razorpay `payment.captured`, `payment.failed`, `refund.processed` (signature-verified, idempotent on `provider_payment_id`).
Webhooks out: none.
Jobs: prod-only `expire_pending_payments` every 5 min (pending_payment > 15 min → cancelled, stock restored).

## The parts that bite

- time zones: store hours are IST wall-clock (`time`), compare in `Asia/Kolkata`; everything else UTC.
- idempotency: place-order key from the client; Razorpay webhooks deduped on payment id.
- races: two carts buying the last unit → conditional decrement; quote shown in cart is re-computed at place-order and the client is told if anything changed.
- prices: client never sends prices; the server re-prices from inventory.
- rate limits: OTP send 3 per 10 min per phone and per IP; Nominatim 1 req/s → server cache + 350 ms client debounce.
- search: Postgres `tsvector` + `pg_trgm` for typos is enough at <50k SKUs.
- realtime: rider location writes throttled to 1 per 5 s.
- offline: cart lives in localStorage and survives reloads; login merges it.
- GDPR/DPDP deletion: delete profile cascades addresses/issues; orders keep with user anonymised (legal invoice retention).

## Build order

1. **Vertical slice** — S02/S03 location, S04 home, S05 category, S10 cart, S11/S12 OTP login, S13 checkout (COD), S15 tracking (derived statuses). Tables: stores, categories, products, variants, inventory, profiles, addresses, orders, order_items. Routes: geo, serviceability, cart/quote, auth, addresses, orders.
2. **Must-haves** — S06 search + suggestions, S07 PDP with variants and rails, S08 variant sheet, S09 floating cart pill, empty states, S16/S17 orders + detail + cancel, S19 account, admin order board + inventory edit, Razorpay.
3. **Should-haves** — shop-by-store, promo banners, coupons, savings banner, reorder rail, help/issue with photo, rider page with live location, notifications.
4. **Could-haves** — share cart, recipes rail, wallet + gift cards, surge fee, rate order.
5. **Fixes from replica-entrepreneur** — after it runs (the public reviews already point at support-bot frustration and refund-vs-replacement rigidity).
