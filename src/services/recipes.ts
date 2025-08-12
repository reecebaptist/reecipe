import supabase from './supabaseClient';
import type { Recipe } from '../data';

// Table: recipes
// Columns: id (uuid, pk), title (text), image (text), cooking_time (text), prep_time (text),
// ingredients (text[]), steps (text[])

export async function listRecipes(): Promise<Recipe[]> {
  if (!supabase) {
    // Supabase not configured, caller can fallback to local data
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('title');

  if (error) throw error;

  return (data || []).map((r) => ({
    title: r.title,
    image: r.image,
    cookingTime: r.cooking_time,
    prepTime: r.prep_time,
    ingredients: r.ingredients || [],
    steps: r.steps || [],
  }));
}

export async function seedRecipes(recipes: Recipe[]) {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  const rows = recipes.map((r) => ({
    title: r.title,
    image: r.image,
    cooking_time: r.cookingTime,
    prep_time: r.prepTime,
    ingredients: r.ingredients,
    steps: r.steps,
  }));

  // Upsert by title to avoid duplicates during development
  const { error } = await supabase.from('recipes').upsert(rows, {
    onConflict: 'title',
  });
  if (error) throw error;
}
