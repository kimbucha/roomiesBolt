// Follow this setup guide to integrate the Deno runtime into your application:
// https://docs.deno.com/runtime/manual/getting_started/setup

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://hybyjgpcbcqpndxrquqv.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const adminApiKey = Deno.env.get('ADMIN_API_KEY') || 'your-secure-api-key'

serve(async (req: Request) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { status: 405, headers }
      )
    }

    // Parse request body
    const { email, apiKey } = await req.json()

    // Validate required parameters
    if (!email || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers }
      )
    }

    // Validate API key
    if (apiKey !== adminApiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, check if the user exists in Auth
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError.message)
      return new Response(
        JSON.stringify({ success: false, message: `Error listing users: ${listError.message}` }),
        { status: 500, headers }
      )
    }
    
    // Find the user with the matching email
    const user = usersData?.users?.find((u: any) => u.email === email)
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found in Auth' }),
        { status: 404, headers }
      )
    }
    
    console.log(`Found user with ID ${user.id} for email ${email}`)

    // Call the delete_user_completely function
    const { data, error } = await supabase.rpc('delete_user_completely', {
      email_param: email
    })

    if (error) {
      console.error('Error deleting user:', error.message)
      return new Response(
        JSON.stringify({ success: false, message: `Error deleting user: ${error.message}` }),
        { status: 500, headers }
      )
    }

    // Check the result (should be boolean)
    if (data !== true) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User deletion function returned false. Check server logs for details.' 
        }),
        { status: 500, headers }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers }
    )
  } catch (error: any) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Unknown error' }),
      { status: 500, headers }
    )
  }
})

/* To invoke locally:
 * 1. Run `supabase functions serve delete-user` in your terminal
 * 2. Make a POST request to http://localhost:54321/functions/v1/delete-user with the required payload
 */ 