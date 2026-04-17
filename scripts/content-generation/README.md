# Content Generation Scripts

This directory contains scripts for generating and managing content for the LTX Workflow website.

## Scripts Overview

### 1. extract-article.py
Extracts article content from HTML files, preserving structure and removing marketing content.

**Usage:**
```bash
python3 scripts/content-generation/extract-article.py <html_file> [output_file]
```

**Features:**
- Preserves heading hierarchy (h1-h4)
- Maintains paragraphs, lists, code blocks, and blockquotes
- Removes marketing content (newsletters, sign-ups, promotions)
- Filters out navigation, footer, and UI elements

**Example:**
```bash
curl -sL "https://example.com/article" -o /tmp/article.html
python3 scripts/content-generation/extract-article.py /tmp/article.html /tmp/article.md
```

### 2. extract-media.py
Extracts image and video URLs from HTML files.

**Usage:**
```bash
python3 scripts/content-generation/extract-media.py <html_file>
```

**Features:**
- Finds all image and video URLs
- Filters out logos, icons, and UI elements
- Outputs organized list of media URLs

**Example:**
```bash
curl -sL "https://example.com/article" -o /tmp/article.html
python3 scripts/content-generation/extract-media.py /tmp/article.html > /tmp/media-urls.txt
```

### 3. download-media.sh
Downloads images and videos from a list of URLs.

**Usage:**
```bash
./scripts/content-generation/download-media.sh <url_file> <output_dir> <prefix>
```

**Parameters:**
- `url_file`: Text file with one URL per line
- `output_dir`: Directory to save files (e.g., `public/images/resources/`)
- `prefix`: Filename prefix (e.g., `tutorial-audio-`)

**Example:**
```bash
# Create URL list
cat > /tmp/urls.txt << EOF
https://example.com/image1.jpg
https://example.com/video1.mp4
EOF

# Download with prefix
./scripts/content-generation/download-media.sh /tmp/urls.txt public/images/resources/ tutorial-audio-
```

### 4. insert-content.js
Inserts or updates content in Supabase database.

**Usage:**
```bash
# Insert new content
node scripts/content-generation/insert-content.js <table> <data.json>

# Update existing content
node scripts/content-generation/insert-content.js <table> <slug> <data.json>
```

**Tables:**
- `blog_posts`
- `tutorials`
- `community`
- `showcase`
- `research`
- `tools`

**Data Format (data.json):**
```json
{
  "slug": "my-article",
  "title": "Article Title",
  "excerpt": "Short description",
  "content": "Full markdown content...",
  "tags": ["tag1", "tag2"],
  "author_name": "ltx workflow",
  "source_url": "https://...",
  "source_title": "Source Title",
  "is_published": true,
  "seo_title": "SEO Title",
  "seo_description": "SEO Description"
}
```

**Example:**
```bash
# Create data file
cat > /tmp/article-data.json << EOF
{
  "slug": "my-tutorial",
  "title": "My Tutorial",
  "excerpt": "Learn something new",
  "content": "# Tutorial\n\nContent here...",
  "tags": ["ltx-2.3", "comfyui"],
  "author_name": "ltx workflow",
  "is_published": true
}
EOF

# Insert into database
node scripts/content-generation/insert-content.js tutorials /tmp/article-data.json
```

## Complete Workflow Example

```bash
# 1. Download HTML
curl -sL "https://example.com/article" -o /tmp/article.html

# 2. Extract content
python3 scripts/content-generation/extract-article.py /tmp/article.html /tmp/content.md

# 3. Extract media URLs
python3 scripts/content-generation/extract-media.py /tmp/article.html > /tmp/media-urls.txt

# 4. Download media files
./scripts/content-generation/download-media.sh /tmp/media-urls.txt public/images/resources/ my-article-

# 5. Prepare data for database
cat > /tmp/data.json << EOF
{
  "slug": "my-article",
  "title": "My Article",
  "excerpt": "Article description",
  "content": "$(cat /tmp/content.md)",
  "tags": ["ltx-2.3"],
  "author_name": "ltx workflow",
  "source_url": "https://example.com/article",
  "is_published": true
}
EOF

# 6. Insert into database
node scripts/content-generation/insert-content.js tutorials /tmp/data.json
```

## Environment Variables

The `insert-content.js` script uses these environment variables (defaults provided):

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://zivfvqaodrdfdifdashi.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
