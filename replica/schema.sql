-- DoorPe (quick-commerce clone) — Postgres schema for Supabase.
-- Money is integer paise (₹1 = 100) with currency 'INR'. Times are timestamptz (UTC).
-- Access: Supabase RLS. Customers read catalogue publicly and own their rows;
-- staff (profiles.role in admin|store|rider) act through server routes using the service key.

create extension if not exists pgcrypto;
create extension if not exists postgis;

-- ---------- people ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  name text,
  email text,
  role text not null default 'customer' check (role in ('customer','admin','store','rider')),
  referral_code text unique default substr(md5(gen_random_uuid()::text),1,8),
  wallet_balance int not null default 0 check (wallet_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text not null default 'home' check (label in ('home','work','other')),
  formatted text not null,
  house_no text not null,
  floor text,
  building text,
  landmark text,
  receiver_name text not null,
  receiver_phone text not null,
  location geography(point,4326) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on addresses (user_id);
create unique index one_default_address on addresses (user_id) where is_default;

-- ---------- stores ----------
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location geography(point,4326) not null,
  service_radius_m int not null default 3000,
  opens_at time not null default '06:00',
  closes_at time not null default '23:00',
  is_open boolean not null default true,
  base_eta_min int not null default 8,
  delivery_fee int not null default 2500,
  free_delivery_above int not null default 19900,
  handling_fee int not null default 200,
  small_cart_fee int not null default 0,
  small_cart_below int not null default 0,
  surge_fee int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on stores using gist (location);

-- ---------- catalogue ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete cascade,
  name text not null,
  slug text unique not null,
  icon text,             -- emoji or image URL
  tint text,             -- background colour token for tiles
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on categories (parent_id, sort_order);

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid not null references categories(id) on delete restrict,
  description text,
  key_info jsonb not null default '{}',
  images text[] not null default '{}',
  icon text,
  tags text[] not null default '{}',
  gst_rate numeric(4,2) not null default 5,
  search tsvector generated always as (to_tsvector('simple', name || ' ' || array_to_string(tags,' '))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on products (category_id);
create index on products (brand_id);
create index on products using gin (search);
create extension if not exists pg_trgm;
create index on products using gin (name gin_trgm_ops);

create table variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  unit_label text not null,
  mrp int not null check (mrp > 0),
  is_default boolean not null default false,
  max_per_order int not null default 10,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on variants (product_id);

create table inventory (
  store_id uuid not null references stores(id) on delete cascade,
  variant_id uuid not null references variants(id) on delete cascade,
  price int not null check (price > 0),
  stock int not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now(),
  primary key (store_id, variant_id)
);
create index on inventory (variant_id);

create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null default 'rail' check (kind in ('rail','banner','store')),
  product_ids uuid[] not null default '{}',
  rule jsonb,                     -- e.g. {"min_discount":25}
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- coupons ----------
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('flat','percent','free_delivery')),
  value int not null default 0,
  min_order int not null default 0,
  max_discount int,
  first_n_orders int,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default upper(substr(md5(gen_random_uuid()::text),1,8)),
  user_id uuid not null references profiles(id) on delete restrict,
  store_id uuid not null references stores(id) on delete restrict,
  address jsonb not null,           -- snapshot; addresses can change later
  status text not null default 'placed' check (status in
    ('pending_payment','placed','packing','packed','out_for_delivery','delivered','cancelled')),
  items_total int not null,
  mrp_total int not null,
  delivery_fee int not null default 0,
  handling_fee int not null default 0,
  small_cart_fee int not null default 0,
  surge_fee int not null default 0,
  tip int not null default 0,
  coupon_code text,
  coupon_discount int not null default 0,
  grand_total int not null,
  currency text not null default 'INR',
  payment_method text not null check (payment_method in ('upi','card','netbanking','wallet','cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded','partially_refunded')),
  instructions text,
  eta_min int not null,
  delivery_otp text not null default lpad((floor(random()*10000))::int::text,4,'0'),
  rider_id uuid references profiles(id) on delete set null,
  placed_at timestamptz not null default now(),
  packed_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on orders (user_id, placed_at desc);
create index on orders (store_id, status);
create index on orders (rider_id) where rider_id is not null;

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references variants(id) on delete restrict,
  name text not null,
  unit_label text not null,
  icon text,
  qty int not null check (qty > 0),
  price int not null,
  mrp int not null,
  fulfilled_qty int,
  created_at timestamptz not null default now()
);
create index on order_items (order_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text unique,
  provider_payment_id text unique,
  amount int not null,
  status text not null check (status in ('created','captured','failed','refunded')),
  raw jsonb,
  created_at timestamptz not null default now()
);
create index on payments (order_id);

create table rider_locations (
  rider_id uuid primary key references profiles(id) on delete cascade,
  location geography(point,4326) not null,
  updated_at timestamptz not null default now()
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  kind text not null check (kind in ('missing','damaged','wrong','quality','late','other')),
  note text,
  photos text[] not null default '{}',
  status text not null default 'open' check (status in ('open','refunded','rejected')),
  refund_amount int not null default 0,
  created_at timestamptz not null default now()
);
create index on issues (order_id);

create table wallet_txns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('refund','giftcard','referral','debit')),
  amount int not null,
  ref text,
  created_at timestamptz not null default now()
);
create index on wallet_txns (user_id, created_at desc);

-- ---------- hard constraints ----------
-- Stock can never go negative: decrement in one statement inside place_order().
create or replace function place_order_decrement(p_store uuid, p_variant uuid, p_qty int)
returns void language plpgsql as $$
begin
  update inventory set stock = stock - p_qty, updated_at = now()
   where store_id = p_store and variant_id = p_variant and stock >= p_qty;
  if not found then raise exception 'OUT_OF_STOCK:%', p_variant; end if;
end $$;

-- Nearest open store that serves a point.
create or replace function serving_store(lat double precision, lng double precision)
returns setof stores language sql stable as $$
  select * from stores
   where is_open and st_dwithin(location, st_makepoint(lng,lat)::geography, service_radius_m)
   order by location <-> st_makepoint(lng,lat)::geography limit 1
$$;

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table issues enable row level security;
alter table wallet_txns enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table inventory enable row level security;
alter table collections enable row level security;
alter table stores enable row level security;
alter table brands enable row level security;
alter table rider_locations enable row level security;

create policy "public read" on categories for select using (true);
create policy "public read" on products for select using (true);
create policy "public read" on variants for select using (true);
create policy "public read" on inventory for select using (true);
create policy "public read" on collections for select using (true);
create policy "public read" on stores for select using (true);
create policy "public read" on brands for select using (true);

create policy "own profile" on profiles for select using (id = auth.uid());
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = 'customer');
create policy "own addresses" on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own orders read" on orders for select using (user_id = auth.uid());
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own issues" on issues for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wallet" on wallet_txns for select using (user_id = auth.uid());
create policy "rider of my order" on rider_locations for select using (
  exists (select 1 from orders o where o.rider_id = rider_locations.rider_id and o.user_id = auth.uid()
          and o.status = 'out_for_delivery'));
-- Orders are inserted/updated only by server routes with the service role (prices are re-computed server side).
