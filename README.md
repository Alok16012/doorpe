# Turant — quick-commerce web app (Blinkit-style)

A clean-room rebuild of the quick-commerce core loop: pick a location → browse or search → add to cart → log in with phone OTP → checkout → live order tracking → help and refunds. Plus a store dashboard for staff.

The look follows Blinkit closely: same layout, colours (green CTA, yellow brand, blue discount flags), type sizes and component shapes, measured from their public mobile site. The name, logo, marketing copy and product images are our own. Product names and brands are fictional demo data.

Product images are [Microsoft Fluent Emoji 3D](https://github.com/microsoft/fluentui-emoji) (MIT licence, copyright Microsoft Corporation), stored in `public/img/e/`. Font: Figtree (SIL Open Font Licence), standing in for the paid Okra font.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

- **Location:** pick any "Popular area" or search. Demo stores cover parts of Delhi, Gurugram, Noida, Mumbai, Bengaluru, Hyderabad, Pune, Kolkata and Chennai.
- **Login:** any 10-digit Indian mobile number. No SMS is sent; the code appears on screen.
- **Staff:** log in as `9999999999` to get the store dashboard at `/admin` (order board, stock editor).
- **Orders** move through the statuses by themselves over the delivery ETA. Pressing a button on the dashboard takes manual control (delivery needs the customer's code).

Data is stored in `.data/db.json`. Delete that file to reset.

## Where things are

| path | what |
| --- | --- |
| `lib/catalog/data.ts` | categories, products, storefronts, rails, banners |
| `lib/geo.ts` | demo dark stores, serviceability, ETA |
| `lib/fees.ts` | delivery, handling, small-cart fees and coupons |
| `lib/pricing.ts` | server-side cart quote |
| `lib/orders.ts` | place, track, cancel, staff advance |
| `lib/db/local.ts` | local JSON driver (swap for Supabase) |
| `lib/brand.ts` + `app/globals.css` | name and colour tokens |
| `replica/` | recon map, architecture, schema, design tokens, feature matrix, build log |

## Before going live

1. Create a Supabase project and run `replica/schema.sql`; add a Supabase driver behind the same functions in `lib/`.
2. Connect an SMS provider for OTP (MSG91 or Twilio) in `lib/auth.ts`.
3. Connect Razorpay for UPI and cards.
4. Replace the demo stores, catalogue and product art with your own.
