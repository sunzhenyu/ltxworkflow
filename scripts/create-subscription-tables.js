const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  const sql = fs.readFileSync('supabase/migrations/create_subscription_tables.sql', 'utf8');

  // Split by semicolon and execute each statement
  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('✓ Success');
      }
    }
  }
}

createTables();
