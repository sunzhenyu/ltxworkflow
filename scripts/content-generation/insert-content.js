const { createClient } = require('@supabase/supabase-js');

/**
 * Insert content into Supabase database
 * Usage: node insert-content.js <table> <data.json>
 *
 * Example data.json format:
 * {
 *   "slug": "my-article",
 *   "title": "Article Title",
 *   "excerpt": "Short description",
 *   "content": "Full markdown content...",
 *   "tags": ["tag1", "tag2"],
 *   "author_name": "ltx workflow",
 *   "source_url": "https://...",
 *   "source_title": "Source Title",
 *   "is_published": true,
 *   "seo_title": "SEO Title",
 *   "seo_description": "SEO Description"
 * }
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zivfvqaodrdfdifdashi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmZ2cWFvZHJkZmRpZmRhc2hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU0MjY5OSwiZXhwIjoyMDkxMTE4Njk5fQ.HhjiE78YelQZoigSKJTsb67dFZtfOuFC1mK9IaUkDcU'
);

async function insertContent(table, data) {
  // Add timestamps
  data.published_at = data.published_at || new Date().toISOString();

  // For blog posts, add read_time_minutes if not provided
  if (table === 'blog_posts' && !data.read_time_minutes) {
    const wordCount = data.content.split(/\s+/).length;
    data.read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log(`✓ Inserted into ${table}:`, result[0].slug);
  return result[0];
}

async function updateContent(table, slug, data) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('slug', slug)
    .select();

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log(`✓ Updated ${table}:`, result[0].slug);
  return result[0];
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node insert-content.js <table> <data.json>');
    console.log('       node insert-content.js <table> <slug> <data.json> (for update)');
    console.log('');
    console.log('Tables: blog_posts, tutorials, community, showcase, research, tools');
    process.exit(1);
  }

  const table = args[0];

  if (args.length === 2) {
    // Insert mode
    const dataFile = args[1];
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    await insertContent(table, data);
  } else {
    // Update mode
    const slug = args[1];
    const dataFile = args[2];
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    await updateContent(table, slug, data);
  }
}

main();
