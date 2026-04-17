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

# 4. Download media (manually separate images and videos)
grep -E '\.(jpg|png|gif|webp)' /tmp/media-urls.txt > /tmp/images.txt
grep -E '\.(mp4|webm|mov)' /tmp/media-urls.txt > /tmp/videos.txt
./scripts/content-generation/download-media.sh /tmp/images.txt public/images/resources/ my-article-
./scripts/content-generation/download-media.sh /tmp/videos.txt public/videos/resources/ my-article-

# 5. Edit content.md and insert media references
# Images: ![Description](/images/resources/my-article-1.jpg)
# Videos: ![Video Description](/videos/resources/my-article-1.mp4)
# Note: Use image markdown syntax for videos - MarkdownContent component auto-detects .mp4/.webm/.mov

# 6. Prepare data and insert into database
cat > /tmp/data.json << EOF
{
  "slug": "my-article",
  "title": "My Article",
  "excerpt": "Description",
  "content": "$(cat /tmp/content.md | jq -Rs .)",
  "tags": ["ltx-2.3"],
  "author_name": "ltx workflow",
  "source_url": "https://example.com/article",
  "is_published": true
}
EOF
node scripts/content-generation/insert-content.js tutorials /tmp/data.json

# 7. Commit to git
git add public/images/resources/my-article-* public/videos/resources/my-article-*
git commit -m "feat: add tutorial with media"
git push
```

## Video Embedding

**Important:** Videos should use the same markdown syntax as images:

```markdown
![Video Description](/videos/resources/video-file.mp4)
```

The `MarkdownContent.tsx` component automatically detects video file extensions (.mp4, .webm, .mov) and renders them as HTML5 video players instead of images. **Do NOT use raw HTML `<video>` tags in markdown content.**

## Environment Variables

The `insert-content.js` script uses these environment variables (defaults provided):

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://zivfvqaodrdfdifdashi.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
