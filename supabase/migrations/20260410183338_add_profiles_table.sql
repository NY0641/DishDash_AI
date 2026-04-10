/*
  # Add User Profiles Table

  ## Summary
  Adds a `profiles` table linked to Supabase auth.users, storing display names
  and dietary preferences. Also ensures categories and recipes tables exist
  (idempotent re-creation for new project setup).

  ## New Tables
  - `profiles`
    - `id` (uuid, PK, FK → auth.users)
    - `display_name` (text)
    - `dietary_prefs` (text[]) — e.g. ['vegetarian', 'gluten-free']
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read and update their own profile
  - Profile auto-created on user sign-up via trigger
*/

CREATE TABLE IF NOT EXISTS categories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text UNIQUE NOT NULL,
  image_url      text NOT NULL DEFAULT '',
  recipe_count   int NOT NULL DEFAULT 0,
  display_order  int NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anyone can view categories'
  ) THEN
    CREATE POLICY "Anyone can view categories"
      ON categories FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO categories (name, image_url, recipe_count, display_order) VALUES
  ('Breakfast', 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400', 240, 1),
  ('Lunch',     'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400', 310, 2),
  ('Dinner',    'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400', 420, 3),
  ('Snacks',    'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400', 180, 4)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS recipes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  ingredients      jsonb NOT NULL DEFAULT '[]',
  instructions     jsonb NOT NULL DEFAULT '[]',
  cook_time_minutes int NOT NULL DEFAULT 0,
  difficulty       text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  image_url        text NOT NULL DEFAULT '',
  tags             text[] NOT NULL DEFAULT '{}',
  is_ai_generated  boolean NOT NULL DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Anyone can view recipes'
  ) THEN
    CREATE POLICY "Anyone can view recipes"
      ON recipes FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Authenticated users can insert recipes'
  ) THEN
    CREATE POLICY "Authenticated users can insert recipes"
      ON recipes FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_searches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query       text NOT NULL,
  session_id  text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_searches' AND policyname = 'Anyone can log a search'
  ) THEN
    CREATE POLICY "Anyone can log a search"
      ON user_searches FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS saved_recipes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  ingredients jsonb NOT NULL DEFAULT '[]',
  instructions jsonb NOT NULL DEFAULT '[]',
  cook_time_minutes int NOT NULL DEFAULT 0,
  difficulty  text NOT NULL DEFAULT 'easy',
  tags        text[] NOT NULL DEFAULT '{}',
  tip         text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_recipes' AND policyname = 'Users can view own saved recipes'
  ) THEN
    CREATE POLICY "Users can view own saved recipes"
      ON saved_recipes FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_recipes' AND policyname = 'Users can save recipes'
  ) THEN
    CREATE POLICY "Users can save recipes"
      ON saved_recipes FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_recipes' AND policyname = 'Users can unsave recipes'
  ) THEN
    CREATE POLICY "Users can unsave recipes"
      ON saved_recipes FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   text NOT NULL DEFAULT '',
  dietary_prefs  text[] NOT NULL DEFAULT '{}',
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_session_id ON user_searches(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
