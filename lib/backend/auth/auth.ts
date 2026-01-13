import { supabase } from "../supabaseClient"

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// lib/backend/auth/auth.ts
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Don't log "Auth session missing!" errors - they're expected
      if (error.message !== 'Auth session missing!' && !error.message.includes('Auth session')) {
        console.error('Auth error:', error.message);
      }
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    
  if (error) throw error
  return data
}