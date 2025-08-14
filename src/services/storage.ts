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

  console.log(uploadError)

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return data.publicUrl;
};
