// app/(tabs)/register/truckService.js
import { supabase } from './supabase-client';

// Fetch all food trucks, newest first
export async function fetchFoodTrucks() {
  const { data, error } = await supabase
    .from('foodtrucks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Fetch single truck by ID
export async function fetchFoodTruck(id) {
  const { data, error } = await supabase
    .from('foodtrucks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Add a new food truck and return created record
export async function addFoodTruck({ name, description, image_url, lat, lng }) {
  const { data, error } = await supabase
    .from('foodtrucks')
    .insert([
      { name, description, image_url, lat, lng }
    ])
    .single();
  if (error) throw error;
  return data;
}

// Update existing food truck by ID
export async function updateFoodTruck(id, updates) {
  const { data, error } = await supabase
    .from('foodtrucks')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Delete a food truck by ID
export async function deleteFoodTruck(id) {
  const { error } = await supabase
    .from('foodtrucks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
