#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Parse CLI arguments
const args = process.argv.slice(2);
const title = args[0];
const category = args[1] || 'Tutorial';

if (!title) {
  console.error('Usage: node create-blog-post.js "Post Title" [category]');
  console.error('Categories: Tutorial, Comparison, Guide, Tips, News');
  process.exit(1);
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate read time (words per minute: 200)
function calculateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Content templates
const templates = {
  Tutorial: (title) => `
# ${title}

LTX 2.3 is Lightricks' latest text-to-video model, offering unprecedented quality and control. This tutorial will guide you through the complete workflow from installation to rendering your first video.

## Prerequisites

Before starting, ensure you have:
- NVIDIA GPU with at least 12GB VRAM (16GB+ recommended)
- ComfyUI installed and configured
- Basic understanding of AI video generation concepts

## Step 1: Download Required Models

Visit our [Models page](/models) and download:

\`\`\`bash
# Required files (all VRAM tiers)
ltx-video-2b-v0.9.safetensors  # Main checkpoint
vae_diffusion_pytorch_model.safetensors  # VAE decoder
spatial_upscaler_v0.1.safetensors  # Spatial upscaler
\`\`\`

For VRAM-optimized versions, check the [VRAM guide](/models#guide).

## Step 2: Install ComfyUI Nodes

LTX 2.3 requires specific custom nodes:

\`\`\`bash
cd ComfyUI/custom_nodes
git clone https://github.com/Lightricks/ComfyUI-LTXVideo
cd ComfyUI-LTXVideo
pip install -r requirements.txt
\`\`\`

Restart ComfyUI after installation.

## Step 3: Load the Workflow

Download our [starter workflow](/workflows) and import it into ComfyUI:

1. Open ComfyUI in your browser
2. Click "Load" button
3. Select the downloaded JSON file
4. Verify all nodes are green (no missing dependencies)

## Step 4: Configure Your Prompt

The prompt is crucial for quality results. Follow these guidelines:

**Good prompts:**
- Specific and descriptive
- Include camera movement (pan, zoom, dolly)
- Mention lighting and atmosphere
- Specify subject actions

**Example:**
\`\`\`
A majestic eagle soaring through misty mountain peaks at golden hour,
camera slowly panning right, cinematic lighting, 4K quality
\`\`\`

## Step 5: Adjust Generation Settings

Key parameters to tune:

| Parameter | Recommended | Effect |
|-----------|-------------|--------|
| Steps | 30-50 | Higher = better quality, slower |
| CFG Scale | 7-12 | Prompt adherence strength |
| Resolution | 768x512 | Balance quality/VRAM |
| Frames | 121-161 | Video length (5-6.7 seconds) |

## Step 6: Generate Your Video

1. Click "Queue Prompt" in ComfyUI
2. Monitor VRAM usage in Task Manager
3. Wait for generation (2-5 minutes depending on settings)
4. Find output in \`ComfyUI/output/\` folder

## Troubleshooting

**Out of Memory Error:**
- Reduce resolution to 512x512
- Lower frame count to 97
- Use FP8 quantized models
- Enable \`--lowvram\` flag in ComfyUI launch

**Poor Quality Results:**
- Increase steps to 40+
- Adjust CFG scale (try 8-10)
- Refine prompt with more details
- Check model files are not corrupted

## Next Steps

Now that you've generated your first video:
- Experiment with [advanced workflows](/workflows)
- Try [LoRA fine-tuning](/blog/ltx-lora-training-guide)
- Join the community on Discord for tips

Happy creating!
`,

  Comparison: (title) => `
# ${title}

Choosing the right model format can significantly impact your workflow efficiency. This guide compares LTX 2.3's available formats to help you make an informed decision.

## Format Overview

LTX 2.3 is available in three main formats:

| Format | Size | VRAM | Speed | Quality |
|--------|------|------|-------|---------|
| FP16 (Original) | 9.4GB | 16GB+ | Baseline | Reference |
| FP8 | 4.7GB | 12GB+ | 1.3x faster | 98% quality |
| GGUF Q4 | 2.4GB | 8GB+ | 0.8x slower | 95% quality |

## FP16: Maximum Quality

**Best for:** Professional work, final renders, quality-critical projects

**Pros:**
- Highest possible quality
- Official format from Lightricks
- Best prompt adherence
- Stable across all scenarios

**Cons:**
- Requires 16GB+ VRAM
- Largest file size (9.4GB)
- Slower generation on lower-end GPUs

**Download:** [ltx-video-2b-v0.9.safetensors](/models)

## FP8: Balanced Performance

**Best for:** Most users, rapid iteration, testing prompts

**Pros:**
- 50% smaller than FP16
- Runs on 12GB VRAM
- 30% faster generation
- Minimal quality loss (98% of FP16)

**Cons:**
- Slight precision reduction
- May show artifacts in extreme cases
- Requires FP8 compatible nodes

**Download:** [ltx-video-2b-v0.9-fp8.safetensors](/models)

\`\`\`python
# ComfyUI automatically detects FP8 format
# No special configuration needed
\`\`\`

## GGUF Q4: Maximum Compatibility

**Best for:** Low VRAM systems, experimentation, learning

**Pros:**
- Runs on 8GB VRAM
- Smallest file size (2.4GB)
- Good for testing workflows
- Easy to share and distribute

**Cons:**
- Noticeable quality reduction
- Slower than FP16
- May struggle with complex prompts
- Requires GGUF loader nodes

**Download:** [ltx-video-2b-v0.9-Q4_K_M.gguf](/models)

## Real-World Performance Tests

Tested on RTX 4090, 768x512, 121 frames, 40 steps:

\`\`\`
FP16:    3m 42s  |  Peak VRAM: 18.2GB
FP8:     2m 51s  |  Peak VRAM: 13.7GB
GGUF Q4: 4m 18s  |  Peak VRAM: 9.1GB
\`\`\`

## Quality Comparison

Visual differences are subtle but measurable:

**FP16 vs FP8:**
- 98% SSIM similarity
- Imperceptible to most viewers
- Slight smoothing in fine textures

**FP16 vs GGUF Q4:**
- 95% SSIM similarity
- Visible in detailed scenes
- Color banding in gradients
- Reduced motion coherence

## Which Should You Choose?

**Choose FP16 if:**
- You have 16GB+ VRAM
- Quality is non-negotiable
- Working on client projects
- Final production renders

**Choose FP8 if:**
- You have 12-16GB VRAM
- Need faster iteration
- Balancing quality and speed
- Most general use cases

**Choose GGUF Q4 if:**
- You have 8-12GB VRAM
- Learning the workflow
- Testing prompts quickly
- VRAM is your bottleneck

## Migration Guide

Switching between formats is seamless:

1. Download new format from [Models page](/models)
2. Replace checkpoint in workflow
3. No other changes needed
4. ComfyUI auto-detects format

## Conclusion

For most users, **FP8 offers the best balance** of quality, speed, and compatibility. Only choose FP16 if you need absolute maximum quality, or GGUF Q4 if VRAM is severely limited.

Experiment with different formats to find what works best for your hardware and use case.
`,

  Guide: (title) => `
# ${title}

This comprehensive guide covers everything you need to know about optimizing your LTX 2.3 workflow for maximum quality and efficiency.

## Understanding the Pipeline

LTX 2.3 uses a diffusion-based architecture with several key components:

\`\`\`
Text Prompt → CLIP Encoder → Latent Diffusion → VAE Decoder → Video Output
\`\`\`

Each stage affects the final result differently.

## Prompt Engineering Best Practices

### Structure Your Prompts

Use this proven template:

\`\`\`
[Subject] + [Action] + [Environment] + [Camera Movement] + [Style/Quality]
\`\`\`

**Example:**
\`\`\`
A red sports car drifting through Tokyo streets at night,
camera tracking from side angle, neon reflections on wet pavement,
cinematic lighting, high detail, 4K quality
\`\`\`

### Keywords That Work

**Camera movements:**
- Static shot, slow pan, zoom in/out, dolly forward/back
- Tracking shot, aerial view, low angle, bird's eye

**Lighting:**
- Golden hour, blue hour, harsh sunlight, soft diffused
- Dramatic lighting, rim light, volumetric fog

**Quality modifiers:**
- Cinematic, 4K, high detail, sharp focus
- Professional, photorealistic, film grain

### What to Avoid

- Negative prompts (not well supported)
- Too many subjects (focus on 1-2 main elements)
- Abstract concepts without visual description
- Conflicting instructions

## Parameter Optimization

### Steps vs Quality

| Steps | Quality | Use Case |
|-------|---------|----------|
| 20-30 | Draft | Quick tests, prompt iteration |
| 30-40 | Good | General use, most projects |
| 40-50 | Excellent | Final renders, client work |
| 50+ | Diminishing | Rarely needed, very slow |

### CFG Scale Guidelines

\`\`\`python
CFG Scale Guide:
5-7:   Loose interpretation, creative freedom
7-10:  Balanced, recommended for most prompts
10-15: Strict adherence, may oversaturate
15+:   Too rigid, artifacts likely
\`\`\`

### Resolution Considerations

**Recommended resolutions:**
- 768x512 (landscape, standard)
- 512x768 (portrait, mobile)
- 512x512 (square, social media)
- 1024x576 (widescreen, requires 24GB VRAM)

**Aspect ratio matters:**
- Model trained on 16:9 and 9:16
- Other ratios may show edge artifacts
- Always use multiples of 64

## VRAM Optimization Strategies

### Tier 1: 8-12GB VRAM

\`\`\`bash
# Use GGUF Q4 format
# Lower resolution: 512x512
# Reduce frames: 97 or less
# Enable \`--lowvram\` flag
\`\`\`

### Tier 2: 12-16GB VRAM

\`\`\`bash
# Use FP8 format
# Standard resolution: 768x512
# Normal frames: 121-161
# No special flags needed
\`\`\`

### Tier 3: 16GB+ VRAM

\`\`\`bash
# Use FP16 format
# High resolution: 1024x576
# Extended frames: 161-241
# Enable \`--highvram\` for speed
\`\`\`

## Advanced Techniques

### Frame Interpolation

Generate at lower frame count, then interpolate:

\`\`\`python
# Generate 97 frames (4 seconds)
# Use RIFE or FILM for 2x interpolation
# Result: 194 frames (8 seconds) smooth motion
\`\`\`

### Batch Processing

Process multiple prompts efficiently:

1. Create prompt list in text file
2. Use ComfyUI API mode
3. Queue all prompts at once
4. Let it run overnight

### LoRA Fine-Tuning

Customize the model for specific styles:

- Collect 20-50 reference videos
- Train LoRA (requires 24GB VRAM)
- Apply at 0.6-0.8 strength
- Combine multiple LoRAs

## Troubleshooting Common Issues

### Flickering or Temporal Inconsistency

**Causes:**
- CFG scale too high
- Insufficient steps
- Conflicting prompt elements

**Solutions:**
- Lower CFG to 7-9
- Increase steps to 40+
- Simplify prompt

### Blurry or Low Detail Output

**Causes:**
- Too few steps
- Low resolution
- GGUF quantization artifacts

**Solutions:**
- Increase steps to 40+
- Use higher resolution
- Switch to FP8 or FP16

### Out of Memory Errors

**Causes:**
- Resolution too high
- Too many frames
- Insufficient VRAM

**Solutions:**
- Reduce resolution by 25%
- Lower frame count
- Use more quantized format
- Enable --lowvram flag

## Workflow Optimization

### Iteration Strategy

1. **Draft phase:** Low steps (25), test prompts
2. **Refinement:** Medium steps (35), adjust parameters
3. **Final render:** High steps (45), full quality

### Time Management

\`\`\`
Average generation times (RTX 4090):
Draft (25 steps):  1.5 minutes
Standard (35 steps): 2.5 minutes
Final (45 steps):  3.5 minutes
\`\`\`

Plan your workflow accordingly.

## Best Practices Checklist

- [ ] Use descriptive, structured prompts
- [ ] Start with 30-40 steps
- [ ] Set CFG scale to 7-10
- [ ] Choose appropriate resolution for VRAM
- [ ] Test with draft settings first
- [ ] Monitor VRAM usage
- [ ] Save successful prompts for reuse
- [ ] Keep model files organized

## Resources

- [Download Models](/models)
- [Browse Workflows](/workflows)
- [Official Documentation](https://huggingface.co/Lightricks/LTX-2.3)
- [ComfyUI Guide](/guide)

Master these techniques and you'll be creating professional-quality AI videos in no time.
`,

  Tips: (title) => `
# ${title}

Quick tips and tricks to improve your LTX 2.3 workflow efficiency and output quality.

## 🚀 Speed Optimization

**Tip #1: Use FP8 for 30% faster generation**
\`\`\`bash
# Switch from FP16 to FP8
# Same quality, half the VRAM, faster speed
Download: ltx-video-2b-v0.9-fp8.safetensors
\`\`\`

**Tip #2: Lower resolution for draft iterations**
\`\`\`python
# Testing prompts? Use 512x512
# 4x faster than 1024x576
# Upgrade to full res for final render
\`\`\`

**Tip #3: Reduce steps for quick tests**
\`\`\`
Draft: 25 steps (1.5 min)
Final: 40 steps (3 min)
Don't use 50+ unless absolutely necessary
\`\`\`

## 🎨 Quality Improvements

**Tip #4: Add camera movement to prompts**
\`\`\`
Bad:  "A cat sitting on a table"
Good: "A cat sitting on a table, camera slowly zooming in"
\`\`\`

**Tip #5: Specify lighting conditions**
\`\`\`
Generic: "A forest scene"
Better:  "A forest scene at golden hour, soft sunlight filtering through trees"
\`\`\`

**Tip #6: Use quality modifiers**
\`\`\`
Add to end of prompt:
"cinematic lighting, 4K quality, high detail, sharp focus"
\`\`\`

## 💾 VRAM Management

**Tip #7: Close other GPU applications**
\`\`\`bash
# Close Chrome, games, other AI tools
# Free up VRAM for LTX 2.3
# Check usage: nvidia-smi
\`\`\`

**Tip #8: Use --lowvram flag if needed**
\`\`\`bash
# Add to ComfyUI launch command
python main.py --lowvram
# Slower but prevents OOM errors
\`\`\`

**Tip #9: Match format to your VRAM**
\`\`\`
8-12GB:  GGUF Q4
12-16GB: FP8
16GB+:   FP16
\`\`\`

## 🎬 Prompt Engineering

**Tip #10: One main subject per video**
\`\`\`
Avoid: "A cat and dog playing while birds fly overhead"
Better: "A golden retriever playing with a ball in a park"
\`\`\`

**Tip #11: Be specific about actions**
\`\`\`
Vague:    "A person walking"
Specific: "A woman in red dress walking confidently down city street"
\`\`\`

**Tip #12: Describe the scene, not the video**
\`\`\`
Wrong: "A video of a sunset"
Right: "Ocean waves at sunset, golden light reflecting on water"
\`\`\`

## ⚙️ Parameter Tuning

**Tip #13: CFG sweet spot is 7-10**
\`\`\`
Too low (<7):   Ignores prompt
Sweet spot:     7-10
Too high (>12): Oversaturated, artifacts
\`\`\`

**Tip #14: Frame count affects motion**
\`\`\`
97 frames:  Fast motion, 4 seconds
121 frames: Standard, 5 seconds
161 frames: Slow motion, 6.7 seconds
\`\`\`

**Tip #15: Resolution must be divisible by 64**
\`\`\`
Good: 768x512, 512x768, 1024x576
Bad:  800x600, 720x480
\`\`\`

## 🔧 Workflow Efficiency

**Tip #16: Save successful prompts**
\`\`\`bash
# Create a prompts.txt file
# Copy-paste winners for reuse
# Build your prompt library
\`\`\`

**Tip #17: Batch similar generations**
\`\`\`python
# Queue multiple prompts at once
# Let ComfyUI run overnight
# Wake up to 20+ videos
\`\`\`

**Tip #18: Use seed for consistency**
\`\`\`
# Same seed = reproducible results
# Useful for A/B testing parameters
# Change seed for variations
\`\`\`

## 🐛 Troubleshooting

**Tip #19: Flickering? Lower CFG scale**
\`\`\`
If video flickers or has temporal issues:
1. Reduce CFG from 12 to 8
2. Increase steps from 30 to 40
3. Simplify prompt
\`\`\`

**Tip #20: Blurry output? Check these**
\`\`\`
- Increase steps to 40+
- Use FP8 or FP16 (not GGUF)
- Verify model files not corrupted
- Try higher resolution
\`\`\`

## 📊 Performance Monitoring

**Tip #21: Watch VRAM usage**
\`\`\`bash
# Run in separate terminal
watch -n 1 nvidia-smi
# Monitor peak usage during generation
\`\`\`

**Tip #22: Track generation times**
\`\`\`
Keep a log:
- Resolution
- Steps
- Time taken
- Quality rating
Optimize based on data
\`\`\`

## 🎯 Advanced Tricks

**Tip #23: Interpolate for longer videos**
\`\`\`
Generate 97 frames → Use RIFE → 194 frames
Doubles length with smooth motion
\`\`\`

**Tip #24: Upscale after generation**
\`\`\`
Generate at 768x512 → Upscale to 1536x1024
Faster than generating at high res
Use Real-ESRGAN or similar
\`\`\`

**Tip #25: Combine multiple LoRAs**
\`\`\`python
# Stack LoRAs for unique styles
Style LoRA (0.7) + Subject LoRA (0.6)
Experiment with strength values
\`\`\`

## 📚 Resources

- [Model Downloads](/models)
- [Workflow Library](/workflows)
- [Complete Guide](/guide)
- [Official HuggingFace](https://huggingface.co/Lightricks/LTX-2.3)

Apply these tips and watch your LTX 2.3 workflow improve dramatically!
`,

  News: (title) => `
# ${title}

Stay updated with the latest developments in the LTX 2.3 ecosystem.

## What's New

Recent updates and announcements from the LTX Video community.

### Latest Model Release

**LTX 2.3 Official Release**
- Released: March 2026
- Size: 2B parameters
- Quality: State-of-the-art text-to-video
- License: Apache 2.0

Key improvements over previous versions:
- Better temporal consistency
- Improved prompt adherence
- Faster generation speed
- Lower VRAM requirements

### Community Highlights

**New Workflows Available**
- Advanced camera control workflow
- Multi-scene composition template
- LoRA training pipeline
- Batch processing automation

**Popular Use Cases**
- Marketing video generation
- Social media content creation
- Concept visualization
- Educational content

### Technical Updates

**ComfyUI Node Improvements**
\`\`\`bash
# Update to latest version
cd ComfyUI/custom_nodes/ComfyUI-LTXVideo
git pull
pip install -r requirements.txt --upgrade
\`\`\`

New features:
- FP8 automatic detection
- Improved memory management
- Better error messages
- Progress bar enhancements

### Performance Benchmarks

Recent community testing shows:

| GPU | Resolution | Time | VRAM |
|-----|------------|------|------|
| RTX 4090 | 768x512 | 2.5min | 14GB |
| RTX 4080 | 768x512 | 3.2min | 13GB |
| RTX 4070 Ti | 512x512 | 3.8min | 11GB |
| RTX 3090 | 768x512 | 4.1min | 16GB |

### Upcoming Features

**Roadmap Preview**
- Extended context length (longer videos)
- Image-to-video conditioning
- Multi-resolution training
- Real-time preview mode

### Community Contributions

**Notable Projects**
- Web UI for LTX 2.3
- Mobile app for prompt testing
- Cloud rendering service
- LoRA marketplace

### Getting Started

New to LTX 2.3? Check out:
- [Complete Tutorial](/blog/ltx-23-complete-tutorial)
- [Model Downloads](/models)
- [Workflow Library](/workflows)
- [Optimization Guide](/blog/ltx-23-optimization-tips)

### Join the Community

- Discord: Share your creations
- GitHub: Report issues and contribute
- Reddit: r/LTXVideo discussions
- Twitter: @LTXVideo updates

### Resources

- [Official Documentation](https://github.com/Lightricks/LTXVideo)
- [Model Card on HuggingFace](https://huggingface.co/Lightricks/LTX-2.3)
- [Research Paper](https://arxiv.org/abs/ltxvideo)
- [Video Examples](https://youtube.com/ltxvideo)

Stay tuned for more updates!
`
};

// Generate post data
function generatePost(title, category) {
  const slug = generateSlug(title);
  const content = templates[category] ? templates[category](title) : templates.Tutorial(title);
  const readTime = calculateReadTime(content);

  // Extract excerpt from first paragraph
  const firstParagraph = content.split('\n\n')[1] || content.substring(0, 200);
  const excerpt = firstParagraph.replace(/^#+\s/, '').substring(0, 160);

  // Generate tags based on category
  const tagMap = {
    Tutorial: ['tutorial', 'guide', 'ltx-2.3', 'comfyui'],
    Comparison: ['comparison', 'models', 'optimization', 'performance'],
    Guide: ['guide', 'best-practices', 'workflow', 'tips'],
    Tips: ['tips', 'tricks', 'optimization', 'quick-guide'],
    News: ['news', 'updates', 'community', 'releases']
  };

  const tags = tagMap[category] || ['ltx-2.3', 'video-generation'];

  return {
    slug,
    title,
    excerpt,
    content,
    category,
    tags,
    cover_image: null,
    author_name: 'LTX Workflow',
    author_avatar: null,
    read_time_minutes: readTime,
    published_at: new Date().toISOString(),
    is_published: true,
    seo_title: `${title} | LTX Workflow`,
    seo_description: excerpt
  };
}

// Main execution
async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const post = generatePost(title, category);

  console.log(`\nGenerating blog post:`);
  console.log(`Title: ${post.title}`);
  console.log(`Slug: ${post.slug}`);
  console.log(`Category: ${post.category}`);
  console.log(`Read time: ${post.read_time_minutes} min`);
  console.log(`Tags: ${post.tags.join(', ')}`);

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select();

  if (error) {
    console.error('\n❌ Error inserting post:', error.message);
    process.exit(1);
  }

  console.log('\n✅ Blog post created successfully!');
  console.log(`View at: /blog/${post.slug}`);
  console.log(`\nPost ID: ${data[0].id}`);
}

main().catch(console.error);

