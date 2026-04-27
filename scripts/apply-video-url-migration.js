const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.error('URL:', supabaseUrl ? 'present' : 'missing');
  console.error('Key:', supabaseServiceKey ? 'present' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Execute each ALTER TABLE statement separately
const statements = [
  "alter table tutorials add column if not exists video_url text",
  "alter table community add column if not exists video_url text",
  "alter table showcase add column if not exists video_url text",
  "alter table research add column if not exists video_url text",
  "alter table tools add column if not exists video_url text"
];

(async () => {
  for (const stmt of statements) {
    console.log(`Executing: ${stmt}`);
    const { data, error } = await supabase.rpc('exec_sql', { query: stmt });
    
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('✓ Success');
    }
  }
  
  console.log('\nMigration complete. Checking schema...');
  
  // Verify by selecting from tutorials
  const { data, error } = await supabase.from('tutorials').select('slug, video_url').limit(1);
  if (error) {
    console.error('Verification failed:', error.message);
  } else {
    console.log('✓ video_url column is now available');
  }
})();
