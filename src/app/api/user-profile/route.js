import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate the data being updated
    const allowedFields = [
      'role',
      'cap_gain_or_not', 
      'size_of_cap_gain',
      'time_of_cap_gain',
      'geographical_zone_of_investment',
      'need_team_contact',
      'location_of_development'
    ];

    const updateData = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update profile' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ user_id: user.id, ...updateData })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create profile' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 