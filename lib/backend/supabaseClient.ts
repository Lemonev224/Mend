import { createClient } from '@supabase/supabase-js'

console.log("Checking Env Vars...");
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// You must add this line to actually create the connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
