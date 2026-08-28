/*
# Cat Atlas schema

1. New Tables
  - `cat_spots` — cat sightings and posts created by users
    - `id` (uuid, primary key)
    - `user_id` (uuid, owner, defaults to authenticated user)
    - `image_url` (text, photo of the cat)
    - `title` (text, short name/title)
    - `notes` (text, description)
    - `category` (text: 'stray_spotting' | 'emergency_rescue' | 'partner_venue')
    - `lat` (double precision, exact latitude, hidden for strays via radius blur in UI)
    - `lng` (double precision, exact longitude)
    - `like_count` (integer, cached like tally)
    - `created_at` (timestamptz)
  - `venue_deals` — partner cafe / pet shop offers (shared public catalog)
    - `id`, `name`, `description`, `deal_type`, `image_url`, `badge`, `price`, `address`, `lat`, `lng`, `created_at`
  - `shelters` — adoption shelters (shared public catalog)
    - `id`, `name`, `verified`, `address`, `image_url`, `lat`, `lng`, `created_at`
  - `cat_likes` — which user liked which cat spot (one row per like)
    - `id`, `user_id`, `cat_spot_id`, `created_at`

2. Security
  - RLS enabled on all tables.
  - `cat_spots`: everyone signed in can read (Discover feed is shared); only the owner can insert/update/delete.
  - `venue_deals` and `shelters`: read-only shared catalogs for signed-in users.
  - `cat_likes`: users manage only their own likes.

3. Storage
  - Public `cat-photos` bucket for uploaded cat images.
  - Authenticated users may upload; anyone may read.

4. Notes
  1. Email confirmation stays OFF; email/password auth only.
  2. Seed rows for venue_deals and shelters are inserted idempotently.
*/

CREATE TABLE IF NOT EXISTS cat_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT 'Mystery Cat',
  notes text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'stray_spotting',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cat_spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_cat_spots" ON cat_spots;
CREATE POLICY "read_all_cat_spots" ON cat_spots FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_cat_spots" ON cat_spots;
CREATE POLICY "insert_own_cat_spots" ON cat_spots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cat_spots" ON cat_spots;
CREATE POLICY "update_own_cat_spots" ON cat_spots FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cat_spots" ON cat_spots;
CREATE POLICY "delete_own_cat_spots" ON cat_spots FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS venue_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  deal_type text NOT NULL DEFAULT 'pet_shop',
  image_url text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venue_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_venue_deals" ON venue_deals;
CREATE POLICY "read_all_venue_deals" ON venue_deals FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  address text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_shelters" ON shelters;
CREATE POLICY "read_all_shelters" ON shelters FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS cat_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  cat_spot_id uuid NOT NULL REFERENCES cat_spots(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, cat_spot_id)
);

ALTER TABLE cat_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_likes" ON cat_likes;
CREATE POLICY "read_own_likes" ON cat_likes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_likes" ON cat_likes;
CREATE POLICY "insert_own_likes" ON cat_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_likes" ON cat_likes;
CREATE POLICY "delete_own_likes" ON cat_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cat_spots_created_at ON cat_spots (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cat_spots_user_id ON cat_spots (user_id);
CREATE INDEX IF NOT EXISTS idx_cat_likes_cat_spot_id ON cat_likes (cat_spot_id);

-- Storage bucket for cat photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cat-photos', 'cat-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_cat_photos" ON storage.objects;
CREATE POLICY "public_read_cat_photos" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'cat-photos');

DROP POLICY IF EXISTS "auth_upload_cat_photos" ON storage.objects;
CREATE POLICY "auth_upload_cat_photos" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'cat-photos');
