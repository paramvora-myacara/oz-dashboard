import { createClient } from '@/lib/supabase/client';

/**
 * Tracks a user event and sends it to the Supabase database.
 *
 * @param {string} event_type - The type of event to track (e.g., 'tax_calculator_used').
 * @param {string} endpoint - The API endpoint or page URL where the event occurred.
 * @param {object} [metadata={}] - Optional metadata to include with the event.
 * @param {object} [user_obj=null] - Optional user object. If not provided, it will be fetched.
 * @returns {Promise<{success: boolean, error?: Error}>} - The result of the operation.
 */
export async function trackUserEvent(event_type, endpoint, metadata = {}, user_obj = null) {
  try {
    const supabase = createClient();
    
    let user = user_obj;

    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      // If no user is logged in, we can't track the event.
      // Depending on requirements, you might want to handle this differently,
      // e.g., by queuing the event and sending it after login.
      console.warn('User not authenticated. Event not tracked.');
      return { success: false, error: new Error('User not authenticated') };
    }

    const eventData = {
      user_id: user.id,
      event_type,
      endpoint,
      metadata,
    };

    const { error } = await supabase.from('user_events').insert([eventData]);

    if (error) {
      console.error('Error tracking event:', error);
      throw error;
    }

    console.log('Event tracked successfully:', eventData);
    return { success: true };
  } catch (error) {
    console.error('Failed to track user event:', error);
    return { success: false, error };
  }
} 