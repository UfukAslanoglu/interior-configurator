import { supabase } from '../lib/supabaseClient';

/**
 * @typedef {Object} DesignPayload
 * @property {string} user_id - The logged-in user's Supabase auth id (from useAuth()'s `user.id`).
 * @property {import('../store/designStore').PlacedItem[]} design_data - The furnished room layout, stored as jsonb.
 */

/**
 * Serializes the current room layout and inserts it into the `designs`
 * table in Supabase. Requires a logged-in user (see hooks/useAuth.js) —
 * `user_id` is required by the table's Row Level Security policies, so an
 * anonymous/unauthenticated call will be rejected by Supabase itself even
 * before hitting the network error handling below. In practice `useAuth`
 * auto-establishes an anonymous session, so this is basically always
 * satisfied without the user seeing a login screen.
 *
 * @param {import('../store/designStore').PlacedItem[]} items
 * @param {string} userId - Comes from `useAuth().user.id`.
 * @param {string|null} [thumbnail] - Small base64 JPEG data URL snapshot of the room, shown in the gallery grid.
 * @returns {Promise<{id: string, user_id: string, design_data: object, thumbnail: string|null, created_at: string}>}
 */
export async function saveDesign(items, userId, thumbnail = null) {
  if (!userId) {
    throw new Error('saveDesign requires a logged-in user (userId is missing).');
  }

  const { data, error } = await supabase
    .from('designs')
    .insert([{ user_id: userId, design_data: items, thumbnail }])
    .select()
    .single();

  if (error) {
    throw new Error(`Design could not be saved: ${error.message}`);
  }

  return data;
}

/**
 * Zaten var olan bir tasarımı günceller (yeni satır açmaz). RLS bunu sadece
 * tasarımın sahibine veya admin'e izin veriyor — başkasının tasarımını
 * güncellemeye çalışırsan Supabase bunu reddeder.
 * @param {string} id
 * @param {import('../store/designStore').PlacedItem[]} items
 * @param {string|null} [thumbnail]
 */
export async function updateDesign(id, items, thumbnail = null) {
  const { data, error } = await supabase
    .from('designs')
    .update({ design_data: items, thumbnail })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Design could not be updated: ${error.message}`);
  return data;
}

/**
 * Bir kullanıcının kaç tasarımı olduğunu sayar — yeni bir tasarım kaydetmeden
 * önce 5 limitine takılıp takılmadığını arayüzde nazikçe göstermek için.
 * Gerçek limit zaten Supabase'deki INSERT policy'sinde zorlanıyor, bu sadece
 * kullanıcıya "5 oda sınırına ulaştın" gibi net bir mesaj verebilmek için.
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function countUserDesigns(userId) {
  const { count, error } = await supabase
    .from('designs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw new Error(`Design count could not be read: ${error.message}`);
  return count ?? 0;
}

/** Herkese açık galeri: tüm kullanıcıların tasarımlarını en yeniden eskiye getirir (RLS: select for everyone). */
export async function listDesigns() {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Bir tasarımı siler. Sadece admin hesabı bunu başarabilir — yetki
 * frontend'de değil, Supabase'deki "Only admin can delete designs" RLS
 * kuralında zorlanıyor, bu fonksiyon sadece isteği gönderir.
 * @param {string} id
 */
export async function deleteDesign(id) {
  const { error } = await supabase.from('designs').delete().eq('id', id);
  if (error) throw new Error(`Design could not be deleted: ${error.message}`);
}