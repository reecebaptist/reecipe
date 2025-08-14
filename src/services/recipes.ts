import { uploadRecipeImage, deleteRecipeImage } from './storage';
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

export const addRecipe = async (
  recipe: Omit<Recipe, 'image'> & { image: File | string }
) => {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  let imageUrl = 'https://placehold.co/600x400?text=No+Image';
  if (recipe.image instanceof File) {
    imageUrl = await uploadRecipeImage(recipe.image);
  } else if (typeof recipe.image === 'string' && recipe.image) {
    imageUrl = recipe.image;
  }

  const row = {
    title: recipe.title,
    image: imageUrl,
    cooking_time: recipe.cookingTime,
    prep_time: recipe.prepTime,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
  };

  const { data, error } = await supabase.from('recipes').insert([row]).select();

  if (error) {
    console.error('Error adding recipe:', error);
    return null;
  }

  return data;
};

export const updateRecipe = async (recipe: Recipe, newImageFile?: File) => {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  let imageUrl = recipe.image;
  if (newImageFile) {
    // If there's a new image, upload it and delete the old one.
    const oldImageUrl = recipe.image;
    imageUrl = await uploadRecipeImage(newImageFile);
    if (oldImageUrl) {
      await deleteRecipeImage(oldImageUrl);
    }
  }

  const row = {
    title: recipe.title,
    image: imageUrl,
    cooking_time: recipe.cookingTime,
    prep_time: recipe.prepTime,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
  };

  const { data, error } = await supabase
    .from('recipes')
    .update(row)
    .eq('title', recipe.title)
    .select();

  if (error) {
    console.error('Error updating recipe:', error);
    return null;
  }

  // Return the updated recipe with the new image URL
  return { ...data?.[0], image: imageUrl } as Recipe;
};

export const deleteRecipe = async (title: string) => {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  // First, get the image URL from the recipe we are about to delete
  const { data: recipeData, error: fetchError } = await supabase
    .from('recipes')
    .select('image')
    .eq('title', title)
    .single();

  if (fetchError) {
    console.error('Error fetching recipe to delete:', fetchError);
    // Proceed to delete from db anyway
  }

  const { error } = await supabase.from('recipes').delete().eq('title', title);

  if (error) {
    console.error('Error deleting recipe:', error);
    return; // Stop if we can't delete the DB record
  }

  // If DB deletion was successful and we have an image URL, delete from storage
  if (recipeData?.image) {
    await deleteRecipeImage(recipeData.image);
  }
};
