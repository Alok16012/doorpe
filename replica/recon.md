# Recon map: Blinkit (web, mobile-first; iOS/Android app referenced from public listings)

Scope: the quick-commerce core loop — set location → browse / search → product → cart → login (phone OTP) → checkout (address, payment) → live order tracking → order history & help. Plus the account surface and the admin/store backend needed to actually run it.
For: the user's own quick-commerce / hyperlocal grocery delivery business (single city or a few dark stores to start). Web app (PWA) first, native later.
Date: 2026-10-22

Clean-room notes: everything below comes from the public website (blinkit.com, read in a browser at human speed with a manually chosen location), the public App Store / Play Store listings, the public FAQ and Terms pages, and public third-party teardowns. No account was logged into, no JS bundles or network calls were read. Checkout, tracking and account screens sit behind login, so those rows are inferred from public descriptions and marked as such.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | website home (location unset + set) | https://blinkit.com/ | mobile layout at ≤800px, desktop at 1400px |
| 2 | category listing | https://blinkit.com/dc/vegetables-fruits/all/?collection_uuid=…&collection_group_id=90651 | left sub-category rail + 2-col grid |
| 3 | product detail | https://blinkit.com/prn/onion-pyaz/prid/530158 | unit variants, rails, recipes |
| 4 | search | https://blinkit.com/s/?q=milk | suggestions + results, "Ad" tag |
| 5 | cart (drawer/page) | reached via floating "View Cart" pill | bill details, charges, empty state |
| 6 | login sheet | account icon / "Login to Proceed" | +91 phone → OTP |
| 7 | FAQ | https://blinkit.com/faq | delivery timings, cancellation, returns, taxes |
| 8 | Terms | https://blinkit.com/terms | lists fee types: delivery, handling, convenience, small-cart, surge |
| 9 | App Store listing | https://apps.apple.com/in/app/blinkit-grocery-in-10-minutes/id960335206 | 4.7★ / 3.7M; feature pitch; payment methods |
| 10 | Play Store listing | https://play.google.com/store/apps/details?id=com.grofers.customerapp | 4.6★ / 1Cr; 100M+ installs; same pitch |
| 11 | Product teardown (ProdLab) | https://prodlab.substack.com/p/blinkit-product-teardown-deconstructing | tracking statuses, surge notice, help w/ photo, 1-min modify |
| 12 | UX case study PDF (NextLeap) | https://assets.nextleap.app/submissions/BlinkitTeardown-c148b9eb-d49a-4664-a944-b8ba0702c1a1.pdf | screenshots of home / tracking / order summary; notes no bottom nav |
| 13 | UX review (Yellowslice) | https://www.yellowslice.in/blog/blinkit-app-user-experience-how-it-became-popular-and-how-to-make-it-even-better | screen list, CTA copy critique |
| 14 | tracking status guide | https://zlash.ai/track/blinkit | status names, tracking screen elements, cancel rule |

## Core loop

A user in a serviceable area adds groceries to a cart in a few taps and gets them delivered from the nearest dark store in roughly 10 minutes, then watches the order live until the rider hands it over.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | App-install interstitial | shown on first load of any page (mobile web) | push to native app | yellow hero w/ 3 phone mockups, "Download the app now" primary, "Continue on web" text link, close × | shown once per session; dismissed |
| S02 | Location prompt | on home when no location | force a location | popover under header "Select your location" + "Use my location" (primary) / "Select manually" (outline) | no-location; after set |
| S03 | Location search sheet | "Select manually" or tap location in header | pick a delivery address | bottom sheet; search input "search delivery location"; "Use current location" row; results list (name + full address, pin icon) | empty, typing, results, (not serviceable — inferred) |
| S04 | Home | `/` | discovery | sticky header (Delivery in N minutes / address ▾ / account icon), search bar w/ rotating placeholder, category sections (4-col tile grid, 4 groups), "Shop by store" carousel, product rails (Hot deals, Your daily fresh needs, Snack it away, Dairy products for you) each with "see all", promo banner w/ 4 sub-tiles, footer "India's last minute app". Desktop: hero banner carousel, 3 promo tiles, 2-row category icon strip, Login + My Cart buttons in header | location unset (dimmed), set, cart non-empty (floating pill) |
| S05 | Category listing | `/dc/<slug>/all/?collection_uuid=…` ; also `/cn/<cat>/cid/<id>/<id>` | browse one category | header (back, ETA/address, search icon), category title bar, left vertical sub-category rail (icon + label, "All" first, active indicator), 2-col product grid, SEO text block at bottom | filled; (empty / out-of-stock inferred) |
| S06 | Search | `/s/?q=` | find products | input w/ back arrow & clear ×, suggestion list (thumb + highlighted match), "Showing results for "q"", 2-col grid, "Ad" tag on sponsored card | empty (blank page, placeholder "Search for atta dal and more"), typing (suggestions), results, (no results inferred) |
| S07 | Product detail (PDP) | `/prn/<slug>/prid/<id>` | decide & add | image carousel (dots mobile / thumbnails desktop), ETA chip, name, "Select Unit" chips (each w/ % off, unit, price, MRP), sticky bottom bar (unit, price, MRP, % off, "Inclusive of all taxes", Add to cart), "View product details" expander (Key Information table, brand "Explore all products"), rails: Similar products / Top products in this category / People also bought, "recipes for you" rail; desktop adds breadcrumb and "Why shop from us?" 3 points | default, after add (stepper + qty badge on chip), variant selected |
| S08 | Variant sheet | card w/ "2 options" ADD | choose unit from a card | bottom sheet listing units w/ price & ADD (inferred from "2 options" label, same chips as S07) | — |
| S09 | Floating cart pill | any page once cart > 0 | shortcut to cart | bottom-fixed green pill: cart icon, "N items", "₹ total", "View Cart ›" | hidden when empty |
| S10 | Cart | "View Cart" | review & proceed | header "My Cart" (back, Share), "Your total savings ₹x" strip, delivery card (timer icon, "Delivery in N minutes", "Shipment of N items"), line items (thumb, name, unit, price, MRP strike, green stepper), Bill details (Items total + "Saved ₹x" chip, Delivery charge ⓘ, Handling charge ⓘ, Grand total ⓘ), Cancellation Policy card, sticky footer "₹total TOTAL — Login to Proceed ›" | 1 item (delivery ₹25), 2 items (delivery ₹12 struck → FREE), empty ("You don't have any items in your cart" + illustration + "Start Shopping") |
| S11 | Login / signup sheet | account icon, "Login to Proceed" | auth | full-screen sheet over scrolling product-image wall, logo, "India's last minute app", "Log in or Sign up", +91 phone input, "Continue" (disabled until 10 digits), T&C line | empty, filled, (OTP step inferred: 4–6 digit OTP, resend timer) |
| S12 | OTP screen (inferred) | after S11 | verify phone | OTP boxes, resend countdown, change number | — |
| S13 | Checkout (inferred, behind login) | "Proceed to pay" | address + payment | address selector (saved Home/Work/Other, add new), delivery instructions, tip for rider, donation toggle, coupon entry, bill summary, payment method list (UPI apps, cards, netbanking, wallets, COD), surge/fee notice, "Pay ₹x" | no address, address set, coupon applied, surge |
| S14 | Add address (inferred) | checkout → add new | capture address | map w/ draggable pin, "Use current location", form: house/flat no., floor, building, landmark, label (Home/Work/Other), receiver name, phone | — |
| S15 | Order confirmed → live tracking (public screenshots) | after payment | reassure & track | green header "Order confirmed / Arriving in N minutes", map with store → home route and rider pin, vertical status timeline (order placed → packing → packed → rider assigned → on the way → delivered), rider card (name, call/chat), delivery OTP (inferred), "Need help" link, item summary | placed, packing, out for delivery, delivered, delayed (ETA bumps w/ notice), cancelled |
| S16 | Orders list (inferred) | account → Orders | history | cards: date, status, item thumbs, total, "Reorder" / "View details" | empty, filled |
| S17 | Order detail / invoice (inferred) | from S16 | audit & help | items, bill, address, payment, "Download invoice", "Need help with this order" | — |
| S18 | Help on order (public teardown) | S15/S17 → Help | raise issue | issue types (missing item, damaged, wrong item, quality), photo upload, chat/bot, refund timeline (3–5 business days) | — |
| S19 | Account (inferred from app + public sources) | account icon when logged in | hub | name/phone, Orders, Addresses, Wallet/Gift cards, Refer & earn, Notifications/settings, Help & support, About/legal, Log out | — |
| S20 | Static pages | `/faq`, `/terms`, `/privacy`, `/contactUs` | legal/help | corporate nav (Home/About/Careers/Partner/Blog) + accordion FAQ | — |

## Flows

```
F01 First-time visitor sets location and lands on home
    S01 (dismiss) -> S02 -> S03 (type, pick result) -> S04
    happy path clicks: 4 (close interstitial, Select manually, type, pick)
    edge: location not serviceable ("coming soon"), GPS permission denied, address outside any store radius

F02 Browse a category and add an item
    S04 (tap category tile) -> S05 (optional: tap sub-category) -> tap ADD -> S09 pill appears
    happy path clicks: 2
    edge: item has variants ("2 options" -> S08), out of stock, qty limit reached

F03 Search and add
    S04 (tap search) -> S06 (type) -> tap suggestion or result ADD
    happy path clicks: 3
    edge: no results, typo suggestions, sponsored results

F04 Product detail to cart
    S05/S06 (tap card) -> S07 (pick unit) -> Add to cart -> S09
    happy path clicks: 3
    edge: variant switch after add (qty badge moves), similar-products add from PDP

F05 Guest cart to login
    S09 -> S10 (adjust qty) -> "Login to Proceed" -> S11 (phone) -> S12 (OTP) -> S13
    happy path clicks: 5
    edge: wrong OTP, resend, cart merges with existing account cart, prices/ETA refresh after login

F06 Checkout and pay (inferred)
    S13 (pick/add address S14) -> choose payment -> Pay -> S15
    happy path clicks: 3 with saved address + saved UPI
    edge: delivery fee changes with cart value (₹25 -> FREE above threshold), surge fee, coupon invalid, payment failed/pending, store closed (store hours 6 AM–11 PM; some areas 24h), min order

F07 Track and receive
    S15 (watch statuses, map) -> rider arrives -> delivered -> rate
    edge: delay (ETA increases with notice), cancel allowed only before "packed", partial fulfilment (item unavailable → refund that item), delivery OTP

F08 Post-order help
    S16 -> S17 -> S18 (pick issue, photo) -> refund to source/wallet
    edge: complaint window by category (from FAQ): perishables & groceries 72h, general merchandise/electronics 24h,
          entire wrong order / marked-delivered-not-delivered 24h, missing freebie 72h, foreign material/expired no limit.
          Grocery non-returnable unless damaged/wrong/expired. Address cannot change after placing; no rescheduling.

F09 Reorder
    S04 "Order again" rail or S16 "Reorder" -> items re-added -> S10
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Header (app bar) | home (ETA + address ▾ + account), inner (back + ETA/address + search icon), cart ("My Cart" + Share), desktop (logo, ETA/address, search, Login, My Cart) | location unset/set | S04–S10 |
| Search bar | home (rotating placeholder, full width, grey), search page (input w/ back & clear) | idle, focused, typing | S04, S06 |
| Category tile | 4-col grid (image on light-grey rounded card + 2-line label), store tile (illustrated, "X Store"), desktop icon strip | default, pressed | S04 |
| Section header | title + "see all" link | — | S04, S07 |
| Product card | grid (2-col, tall image), rail (horizontal scroll, ~3 visible), compact (search) | default, discount ribbon (blue "21% OFF" top-left), "Ad" tag, "2 options" under ADD, unit dropdown ▾ (green), stepper after add, out of stock (inferred) | S04–S07 |
| ADD / stepper | outline green "ADD" → filled green "[− 1 +]"; cart line item stepper (larger) | 0, n, max | all product surfaces, S10 |
| Price block | price bold, MRP struck grey, % off | with / without discount | cards, S07, S10 |
| ETA chip | "⏱ 9 MINS" small pill | — | cards, S07 |
| Unit/variant chip | bordered card w/ % off badge, unit, price, MRP; selected = green border + qty badge | selected, unselected | S07, S08 |
| Bottom sheet | location search, variant picker, login | — | S03, S08, S11 |
| Floating cart pill | green, bottom fixed | hidden/visible, count/total animate | S09 |
| Bill details card | rows with icon, label, ⓘ tooltip, value; struck original value; chips "Saved ₹x" | free delivery, surge | S10, S13 |
| Info banner | blue "Your total savings ₹x" strip; cancellation policy card | — | S10 |
| Primary button | filled green (#0c831f-ish), full width; outline green; black (desktop "Use App"); disabled grey | default, loading, disabled | everywhere |
| Status timeline | vertical steps w/ check icons | current, done, pending | S15 |
| Map | store→home route, rider marker | live | S15 |
| Toast / snackbar | "Added to cart" style (inferred) | — | — |
| Empty state | illustration + title + subtitle + CTA | — | S10, S06, S16 |
| Accordion | FAQ sections | collapsed/expanded | S20 |
| Image carousel | dots (mobile), thumbnails (desktop), prev/next | — | S07 |
| Promo banner | full-bleed image + headline + sub-tiles | — | S04 |

## Inferred data model

```
Store        id, name, lat, lng, service_radius_m, polygon (geo), is_open, opens_at, closes_at,
             delivery_fee_base, free_delivery_above, handling_fee, small_cart_fee, min_order
             evidence: S02/S03 "curated assortment from your nearest store", FAQ "every store has its own delivery charges", ETA changes per location
             confidence: high

Category     id, parent_id (null = group like "Grocery & Kitchen"), name, slug, image_url, sort_order, is_store_front (bool, for "Shop by store")
             evidence: S04 groups → tiles, S05 left rail sub-categories, URLs /cn/<slug>/cid/<l1>/<l2>
             confidence: high

Product      id, name, slug, brand_id, category_id, description, key_information (json), images[], tags[], is_sensitive (hide-able), gst_rate
             evidence: S07 "Key Information", brand "Explore all products", recipes rail, FAQ taxes section
             confidence: high

Variant      id, product_id, unit_label ("1 kg", "2 x 1 kg", "500 ml"), mrp, is_default, max_qty_per_order
             evidence: S07 "Select Unit" chips, cards "2 options", unit dropdown ▾
             confidence: high

Inventory    store_id, variant_id, price (sale), stock_qty, is_available
             evidence: price/ETA change by location; same item different price across stores
             confidence: medium

Collection   id, title ("Hot deals"), slug, type (rail | banner | store), store_id?, product_ids[] or rule (json), sort_order
             evidence: S04 rails with "see all", /dc/<slug> collection URLs with collection_uuid
             confidence: high

User         id, phone (unique, +91), name?, email?, created_at, referral_code
             evidence: S11 phone-only login, Terms "must register and log in to order"
             confidence: high

Address      id, user_id, label (home|work|other), lat, lng, formatted, house_no, floor, building, landmark, receiver_name, receiver_phone, is_default
             evidence: app location mock "WORK - Floor First, Blinkit office, tower 1", FAQ "cannot change address after order"
             confidence: medium

Cart         id, user_id? (null for guest; device_id), store_id, address_id?, updated_at
CartItem     cart_id, variant_id, qty
             evidence: S09/S10, guest cart before login
             confidence: high

Order        id, user_id, store_id, address_id (snapshot json), status (placed|accepted|packing|packed|rider_assigned|out_for_delivery|delivered|cancelled|partially_fulfilled),
             items_total, discount_total, delivery_fee, handling_fee, surge_fee, tip, donation, coupon_id, grand_total, payment_status,
             eta_minutes, promised_at, delivered_at, cancel_reason, cancelled_by, delivery_otp, rider_id, instructions
             evidence: S10 bill rows, S15 statuses (teardown + tracking guide), FAQ cancel rule "not after packed", teardown "1-minute modify window", surge notice
             confidence: high for fields seen in bill; medium for status names

OrderItem    order_id, variant_id, name_snapshot, unit_snapshot, qty, unit_price, mrp, gst_rate, fulfilled_qty
             evidence: S10 line items, FAQ "partially fulfilled → refund undelivered product", GST split per item
             confidence: high

Payment      id, order_id, provider, method (upi|card|netbanking|wallet|cod|bnpl), amount, status, provider_ref
             evidence: store listings list UPI/COD/cards/wallets/netbanking/BNPL
             confidence: high

Rider        id, name, phone, store_id, status (offline|available|on_delivery), lat, lng, updated_at
             evidence: S15 rider name + live map ("Rohit is on his way")
             confidence: medium

Coupon       id, code, type (flat|percent|free_delivery), value, min_order, max_discount, valid_from/to, first_order_only, usage_limit
             evidence: "Free delivery on first 10 orders" banner, coupons mentioned in public sources
             confidence: medium

Issue        id, order_id, order_item_id?, type (missing|damaged|wrong|quality|other), photos[], status, refund_amount, refund_to (source|wallet)
             evidence: teardown "help with photo upload", FAQ complaint windows
             confidence: medium

WalletTxn    id, user_id, type (refund|giftcard|referral|debit), amount, ref
             evidence: public "Blinkit Money" / gift card articles
             confidence: guess
```

Relationships: Store 1-n Inventory n-1 Variant n-1 Product n-1 Category (tree). User 1-n Address, 1-n Order, 1-1 Cart. Order 1-n OrderItem, 1-n Payment, 0-1 Rider, 0-n Issue. Collection n-n Product. Coupon 1-n Order.

## Feature matrix

See `features.csv`. Must: 31, should: 13, could: 12; 5 of those are marked skip.

## Out of scope (cannot or should not be cloned)

- The brand, logo, yellow/green identity, product photography, copy and SEO text — all owned; replica-brand replaces them.
- The catalogue itself (30,000 SKUs with images from brands) — the clone seeds its own catalogue; demo data uses generic names and placeholder images.
- The dark-store network, riders, 20+ cities, 10-minute promise — operations, not software. The clone supports N stores; the user supplies them.
- Partner workflows: Print store, Pharmacy consultations, Ambulance, co-branded SBI credit card, Bistro/District/Feeding India cross-links.
- Paid search ads ("Ad" tag) marketplace — keep the tag/slot, skip the advertiser side.
- Native-app-only extras (gift packaging, app-exclusive offers) until a native build exists.

## Size

Screens 20 (14 seen directly, 6 inferred behind login), flows 9, entities 17.
Hard parts: (1) geo serviceability + per-store inventory and pricing, (2) live order tracking with rider location (realtime channel), (3) payments with UPI/cards and COD plus refunds, (4) cart/ETA/fee rules that recompute live (free-delivery threshold, surge, handling), (5) admin + rider surfaces that nobody sees but without which nothing ships.
Size: **L** (a quarter for a solid single-city clone with admin and rider view; the customer web app alone is M).
