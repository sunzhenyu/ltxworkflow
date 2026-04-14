#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  console.log('Creating blog_posts table...\n');

  // Check if table exists
  const { data: existingTable } = await supabase
    .from('blog_posts')
    .select('id')
    .limit(1);

  if (existingTable !== null) {
    console.log('✅ Table blog_posts already exists');
    return;
  }

  console.log('Table does not exist. Please create it manually in Supabase Dashboard:');
  console.log('\n1. Go to https://supabase.com/dashboard/project/zivfvqaodrdfdifdashi/editor');
  console.log('2. Click "SQL Editor" in the left sidebar');
  console.log('3. Click "New Query"');
  console.log('4. Paste the SQL from supabase/migrations/create_blog_posts.sql');
  console.log('5. Click "Run" to execute\n');
}

createTable();
