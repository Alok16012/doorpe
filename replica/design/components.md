# DoorPe components

Tokens: `replica/design/tokens.json` → `app/globals.css` (`--color-*`, mapped into Tailwind as `bg-surface`, `text-muted`, `border-input`…). Icons: Lucide (ISC). Product art: emoji on a tinted tile (our own, no photography from the original). Font: Manrope (OFL) via `next/font/google`.

```
Header
  variants  home (ETA + address ▾ + account), inner (back + ETA/address + search icon), title (back + title + action), desktop (logo, ETA/address, search, Login/Account, Cart button)
  states    location unset ("Set delivery location"), set, not serviceable (warning text)
  tokens    bg bg, text text, ETA type xl/800, address sm/500 text-muted, sticky, border-b border on scroll
  a11y      <header>, address is a <button> that opens LocationSheet, account is a labelled link
  used on   S04–S07, S10, S13, S15

SearchBar
  variants  home trigger (rotating placeholder, links to /s), live input (autofocus, back, clear)
  states    idle, focus (ring accent 2px), typing, loading
  tokens    bg surface, border border, radius md, h 48, text sm
  a11y      role=search, input type=search with aria-label; rotating word is aria-hidden, static label for SR
  used on   S04, S06

CategoryTile
  variants  grid (4 col mobile / 8–10 col desktop), store (illustrated card)
  states    default, pressed (scale .97)
  tokens    tile bg surface-tint, radius md, label xs/600 2 lines
  a11y      link with full category name
  used on   S04

ProductCard
  variants  grid, rail (w 148/180), compact
  states    default, discounted (deal ribbon top-left "21% OFF"), has options ("N options" under ADD), in cart (stepper), out of stock (greyed art + "Out of stock" + ADD disabled), sponsored ("Ad")
  tokens    bg bg, border border, radius md, name sm/600 2 lines, unit xs text-muted, price sm/800, MRP xs strike text-faint
  a11y      article; product name is the link; ADD button label "Add <name> <unit>"
  used on   S04–S07

AddButton / Stepper
  variants  outline "ADD" (accent text, accent border, accent-soft bg), filled stepper [– n +] (accent bg, on-accent), large (PDP/cart)
  sizes     sm h 32 w 72, lg h 40
  states    0, n, at max (+ disabled with toast "Only N per order"), out of stock (disabled), loading
  a11y      buttons "Decrease"/"Increase" quantity of <name>, live region announces qty
  used on   cards, S07, S10

Price
  parts     price (₹, no decimals unless needed), MRP strike, % off chip
  used on   cards, S07, S10

EtaChip     "⏱ 9 MINS" 2xs/700, bg surface, radius xs. Used on cards and S07.

VariantChips
  states    selected (accent border + accent-soft bg + qty badge), unselected, out of stock
  used on   S07, VariantSheet

BottomSheet
  variants  sheet (mobile, slides up, max-h 85vh, drag handle), dialog (desktop, centred, max-w 480)
  states    open, closing; scrim scrim/50
  a11y      role=dialog aria-modal, focus trapped, Esc closes, returns focus to opener, body scroll locked
  used on   LocationSheet, VariantSheet, LoginSheet

CartBar (floating pill)
  states    hidden (0 items), visible (count, total, "View cart ›"), bump animation on add
  tokens    bg accent, text on-accent, radius md, shadow pop, h 56
  a11y      link "View cart, N items, ₹X"
  used on   all catalogue pages (mobile); desktop uses header cart button

BillDetails
  rows      Item total (+ "Saved ₹x" info chip, MRP strike), Delivery fee (ⓘ, strike + FREE), Handling fee (ⓘ), Small cart fee (conditional), Tip (conditional), Coupon (–), Grand total
  nudges    "Add ₹X more for FREE delivery" progress bar (our improvement)
  a11y      definition list; tooltips are buttons with aria-describedby
  used on   S10, S13, S17

SavingsBanner  info-soft strip "You're saving ₹x on this order". S10, S13.

Button
  variants  primary (accent), secondary (outline accent), ghost, danger, dark
  sizes     sm 32, md 40, lg 52
  states    default, hover (accent-hover), active, focus-visible ring, disabled (surface + text-faint), loading (spinner, label kept for SR)
  used on   everywhere

StatusTimeline  vertical steps (done = success check, current = accent pulsing dot, pending = border); S15, S17
LiveMap         Leaflet + OSM; store pin, home pin, rider pin interpolated; attribution kept. S15, S14
Toast           bottom-centre above CartBar, auto-dismiss 2.5 s, role=status
EmptyState      icon in tinted circle + title lg + body sm muted + primary CTA; S06, S10, S16
Skeleton        surface shimmer blocks for cards and rails
Banner          tinted card, headline xl/800, sub sm, CTA dark sm; S04
```
