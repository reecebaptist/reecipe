import supabase from './supabaseClient';

const BUCKET_NAME = 'recipes-images';

export const uploadRecipeImage = async (file: File) => {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  const fileExt = file.name.split('.').pop();
  const sanitizedOriginalName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
  const fileName = `${Date.now()}-${sanitizedOriginalName}.${fileExt}`;
  const filePath = `private/${fileName}`;


  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteRecipeImage = async (imageUrl: string) => {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  if (!imageUrl.includes(BUCKET_NAME)) {
    // Not a Supabase storage URL that we should handle
    return;
  }

  const pathStartIndex = imageUrl.indexOf(BUCKET_NAME) + BUCKET_NAME.length + 1;
  const imagePath = imageUrl.substring(pathStartIndex);

  if (!imagePath) {
    console.warn('Could not determine image path from URL:', imageUrl);
    return;
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([imagePath]);

  if (error) {
    // It's okay if the image doesn't exist, so we can log non-critical errors
    console.warn('Could not delete image from storage:', error.message);
  }
};
