import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  image_url: string;
  recipe_count: number;
  display_order: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  ingredients: string[];
  instructions: string[];
  cook_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url: string;
  tags: string[];
  is_ai_generated: boolean;
  created_at: string;
};

export type UserSearch = {
  id: string;
  query: string;
  session_id: string;
  created_at: string;
};

export type SavedRecipe = {
  id: string;
  recipe_id: string;
  user_id: string;
  created_at: string;
};
