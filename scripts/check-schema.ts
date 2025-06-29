import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function checkSchema() {
  console.log('🔍 CHECKING CURRENT DATABASE SCHEMA\n');
  
  try {
    // Check what tables exist in public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
      
      // Try direct query instead
      const { data: directTables, error: directError } = await supabase
        .rpc('get_table_names');
      
      if (directError) {
        console.log('❌ Direct query also failed:', directError.message);
        
        // Try a simple select to test connection
        const { data: testData, error: testError } = await supabase
          .from('roommate_profiles')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.log('❌ Cannot access roommate_profiles:', testError.message);
        } else {
          console.log('✅ roommate_profiles table exists and is accessible!');
          
          // Get count of profiles
          const { count } = await supabase
            .from('roommate_profiles')
            .select('*', { count: 'exact', head: true });
          
          console.log(`📊 Found ${count} profiles in database`);
        }
        
        return;
      }
    }
    
    console.log('📋 EXISTING TABLES:');
    if (tables && tables.length > 0) {
      tables.forEach(t => console.log('  -', t.table_name));
    } else {
      console.log('  No tables found in information_schema query');
    }
    
    // Check specific tables we need
    const requiredTables = ['roommate_profiles', 'matches', 'conversations', 'messages', 'swipes'];
    console.log('\n✅ REQUIRED TABLES STATUS:');
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${table} - ${error.message}`);
        } else {
          console.log(`  ✅ ${table} - accessible`);
          
          // Get count
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          console.log(`      ${count || 0} records`);
        }
      } catch (err) {
        console.log(`  ❌ ${table} - ${err}`);
      }
    }
    
  } catch (error) {
    console.log('❌ General error:', error);
  }
}

checkSchema().catch(console.error); 