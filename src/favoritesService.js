// src/favoritesService.js
import { supabase } from './supabase-client';

// Fetch all favorite food trucks for the current user
export async function fetchFavoriteTrucks() {
  // Ensure user is signed in
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error('Not authenticated');

  const userId = session.user.id;
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      foodtrucks (
        id,
        name,
        description,
        image_url,
        lat,
        lng
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(record => record.foodtrucks);
}

// Check if a given foodtruck is already favorited by the user
export async function isFavorited(foodtruckId) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error('Not authenticated');

  const userId = session.user.id;
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('foodtruck_id', foodtruckId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return !!data;
}

// Insert a new favorite
export async function insertFavorite(foodtruckId) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error('Not authenticated');

  const userId = session.user.id;
  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, foodtruck_id: foodtruckId }]);

  if (error) throw error;
  return true;
}

// Delete an existing favorite
export async function deleteFavorite(foodtruckId) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error('Not authenticated');

  const userId = session.user.id;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('foodtruck_id', foodtruckId);

  if (error) throw error;
  return true;
}
