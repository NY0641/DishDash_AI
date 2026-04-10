/*
  # AI Cooking Companion — Initial Schema

  ## Summary
  Creates all core tables for the AI Cooking Companion app.

  ## New Tables

  ### 1. `categories`
  Meal categories (Breakfast, Lunch, Dinner, Snacks, etc.)
  - `id` (uuid, primary key)
  - `name` (text, unique) — display name
  - `image_url` (text) — Pexels cover photo URL
  - `recipe_count` (int) — approximate count label
  - `display_order` (int) — ordering for UI

  ### 2. `recipes`
  Stores AI-generated and curated recipe records.
  - `id` (uuid, primary key)
  - `title` (text) — recipe name
  - `description` (text) — short summary
  - `category_id` (uuid, FK → categories)
  - `ingredients` (jsonb) — array of ingredient strings
  - `instructions` (jsonb) — array of step strings
  - `cook_time_minutes` (int)
  - `difficulty` (text) — 'easy' | 'medium' | 'hard'
  - `image_url` (text)
  - `tags` (text[]) — e.g. ['vegetarian', 'quick']
  - `is_ai_generated` (boolean)
  - `created_at` (timestamptz)

  ### 3. `user_searches`
  Logs every AI prompt / search query entered by visitors.
  - `id` (uuid, primary key)
  - `query` (text) — the prompt text
  - `session_id` (text) — anonymous client session identifier
  - `created_at` (timestamptz)

  ### 4. `saved_recipes`
  Tracks recipes bookmarked by authenticated users.
  - `id` (uuid, primary key)
  - `recipe_id` (uuid, FK → recipes)
  - `user_id` (uuid, FK → auth.users)
  - `created_at` (timestamptz)
  - UNIQUE (user_id, recipe_id)

  ## Security
  - RLS enabled on all tables
  - `categories` and `recipes`: anon + authenticated SELECT (public catalogue)
  - `user_searches`: anon INSERT (logging), authenticated SELECT own rows
  - `saved_recipes`: authenticated INSERT / SELECT / DELETE on own rows only

  ## Seed Data
  - 4 initial categories pre-populated
*/

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text UNIQUE NOT NULL,
  image_url      text NOT NULL DEFAULT '',
  recipe_count   int NOT NULL DEFAULT 0,
  display_order  int NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── RECIPES ─────────────────────────────────────────────────────────────────

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

CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ─── USER SEARCHES ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_searches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query       text NOT NULL,
  session_id  text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a search"
  ON user_searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view own searches"
  ON user_searches FOR SELECT
  TO authenticated
  USING (auth.uid()::text = session_id);

-- ─── SAVED RECIPES ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_recipes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes"
  ON saved_recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON saved_recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON saved_recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_searches_session_id ON user_searches(session_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created_at ON user_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);

-- ─── SEED CATEGORIES ─────────────────────────────────────────────────────────

INSERT INTO categories (name, image_url, recipe_count, display_order) VALUES
  ('Breakfast', 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400', 240, 1),
  ('Lunch',     'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400', 310, 2),
  ('Dinner',    'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400', 420, 3),
  ('Snacks',    'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400', 180, 4)
ON CONFLICT (name) DO NOTHING;
