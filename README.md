# DoorPe — quick-commerce web app (Blinkit-style)

A clean-room rebuild of the quick-commerce core loop: pick a location → browse or search → add to cart → log in with phone OTP → checkout → live order tracking → help and refunds. Plus a store dashboard for staff.

The layout follows Blinkit closely: same structure, type sizes and component shapes, measured from their public mobile site. The colour theme is our own pastel blue (tokens in `replica/design/tokens.json` → `app/globals.css`). The name, logo, marketing copy and product images are our own. Product names and brands are fictional demo data.

Item images are real photographs from Wikimedia Commons, optimized and stored locally in `public/img/items/`. Source, author, and license details are available at `/photo-credits` and in `public/img/items/credits.json`. Regenerate assets with `python3 scripts/import-item-photos.py` (requires Pillow and network access); selections are maintained in `scripts/item-photo-plan.json`. Font: Figtree (SIL Open Font Licence), standing in for the paid Okra font.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

- **Location:** pick any "Popular area" or search. Demo stores cover parts of Delhi, Gurugram, Noida, Mumbai, Bengaluru, Hyderabad, Pune, Kolkata and Chennai.
- **Login:** any 10-digit Indian mobile number. No SMS is sent; the code appears on screen.
- **Admin panel:** log in as `9999999999` and open `/admin`. Other admins can be added from Customers.
- **Rider app:** open `/rider` on a phone and log in as `8888888888` or `7777777777` (Connaught Place store). Add real riders from Admin → Riders.
- **Orders** move through the statuses by themselves over the delivery ETA. Pressing a button on the dashboard takes manual control (delivery needs the customer's code).

Data is stored in `.data/db.json`. Delete that file to reset.

## Admin panel (`/admin`)

| page | what you can do |
| --- | --- |
| Dashboard | today's orders, revenue, average order, live orders, open complaints, 7-day chart, low stock |
| Live board | move orders through packing, packed, out for delivery, delivered (needs the customer's code) |
| Orders | filter by status, store or search; open an order to advance it or cancel and refund |
| Products | add, edit, hide or show products; sizes, MRP, selling price, default stock, image, details |
| Categories | add or edit categories and sub-categories, reorder tiles, hide them |
| Inventory | set stock per store, quick +10/+50 buttons, low-stock filter |
| Stores | pause a store, change hours and delivery radius |
| Customers | orders, spend, wallet; credit or debit the wallet; make someone an admin |
| Coupons | create flat, percent or free-delivery codes with minimum order, cap, expiry, first-order-only |
| Complaints | refund or reject late-delivery and other complaints (item problems refund automatically) |
| Reports | 14-day revenue, top products, sales by category, payment methods, average delivery time |
| Fees & settings | delivery fee, free-delivery threshold, handling fee, small-order fee, tip buttons |

Every change shows up in the store on the next page load.

## Rider app (`/rider`)

A mobile web app for delivery partners. Install it to the home screen; it has its own app manifest.

1. **On duty / off duty.** While on duty (or on a delivery) the phone's GPS is sent every 5 seconds and the customer's map shows the real rider.
2. **Orders.** New orders at the rider's store show up with trip pay, distance, item count and any cash to collect. The phone buzzes on new ones. One active delivery at a time.
3. **Steps.** Accept → slide "Reached the store" → item checklist → slide "Picked up" (only after the store marks it packed) → "Navigate to customer" opens Google Maps → slide "Reached the customer" → enter the customer's 4-digit code (and confirm cash for COD) → delivered.
4. **Earnings.** ₹25 per trip + ₹6 per km + 100% of tips. Today, last 7 days, recent trips, and cash to hand over.
5. **Profile.** Name and vehicle number customers see, store, safety notes, log out.

When at least one rider is on duty at a store, new orders wait at "Packed" with "Finding a delivery partner" until a rider accepts. With no riders on duty, orders move by themselves as before (demo mode).

To test a rider and a customer at the same time in one browser, open the customer site on `localhost:3000` and the rider app on `127.0.0.1:3000`; they keep separate logins.

## Where things are

| path | what |
| --- | --- |
| `lib/catalog/data.ts` | the demo catalogue used to seed the database on first run; storefronts, rails, banners |
| `lib/geo.ts` | demo dark stores, serviceability, ETA |
| `lib/fees.ts` | delivery, handling, small-cart fees and coupons |
| `lib/pricing.ts` | server-side cart quote |
| `lib/orders.ts` | place, track, cancel, staff advance |
| `lib/db/local.ts` | local JSON driver (swap for Supabase); holds the editable catalogue, coupons, fees and store settings |
| `lib/admin.ts` + `app/admin/` | admin queries, actions and pages |
| `lib/rider.ts` + `app/rider/` + `app/api/rider/` | rider workflow, pay, earnings, rider screens |
| `lib/brand.ts` + `app/globals.css` | name and colour tokens |
| `replica/` | recon map, architecture, schema, design tokens, feature matrix, build log |

## Before going live

1. Create a Supabase project and run `replica/schema.sql`; add a Supabase driver behind the same functions in `lib/`.
2. Connect an SMS provider for OTP (MSG91 or Twilio) in `lib/auth.ts`.
3. Connect Razorpay for UPI and cards.
4. Replace the demo stores, catalogue and product art with your own.
