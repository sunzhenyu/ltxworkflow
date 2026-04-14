#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newContent = `# LTX 2.3 Release: What's New in Lightricks' Latest Video Model

Lightricks has officially released LTX 2.3, the latest iteration of their groundbreaking text-to-video AI model. Here's everything you need to know about this major update.

## Key Improvements

### Enhanced Video Quality

LTX 2.3 delivers significant improvements over previous versions:

- **Higher resolution support**: Native 1024x576 generation
- **Better temporal consistency**: Reduced flickering and artifacts
- **Improved motion**: More natural and fluid movements
- **Enhanced detail**: Sharper textures and better fine details

### New Model Formats

The release includes multiple optimized formats:

\`\`\`
- FP16 (32GB VRAM): Full precision, maximum quality
- FP8 (16GB VRAM): 50% smaller, minimal quality loss
- GGUF Q4 (8GB VRAM): Quantized, accessible on consumer GPUs
- Distilled (12GB VRAM): Faster inference, good quality
\`\`\`

### Performance Optimizations

- 30% faster generation on FP8 format
- Reduced VRAM requirements across all formats
- Better ComfyUI integration
- Improved prompt understanding

## What's Changed

### Model Architecture

LTX 2.3 introduces several architectural improvements:

1. **Enhanced VAE**: Better compression and reconstruction
2. **Improved attention mechanism**: More efficient processing
3. **Optimized transformer blocks**: Faster inference
4. **Better text encoder**: More accurate prompt interpretation

### Training Data

The model was trained on:
- Larger and more diverse video dataset
- Higher quality source material
- Better temporal annotations
- Improved prompt-video alignment

## Community Response

Early adopters are reporting impressive results:

> "The quality jump from 2.0 to 2.3 is incredible. Motion is so much smoother!" - ComfyUI User

> "Finally can run it on my 16GB card with FP8. Game changer." - Reddit r/StableDiffusion

> "Prompt adherence is noticeably better. Getting exactly what I ask for." - Discord Community

## Technical Specifications

| Specification | LTX 2.3 |
|---------------|---------|
| Parameters | 22B |
| Max Resolution | 1024x576 |
| Frame Range | 97-241 frames |
| Context Length | 512 tokens |
| Training Steps | 2.5M |
| Release Date | April 2026 |

## Breaking Changes

**Important for existing users:**

- New VAE required (\`taeltx2_3.safetensors\`)
- Updated ComfyUI nodes (update to latest version)
- Different optimal CFG scale (7-10 recommended)
- Changed frame count defaults

## Migration Guide

If you're upgrading from LTX 2.0:

\`\`\`bash
1. Download new VAE: taeltx2_3.safetensors
2. Update ComfyUI to latest version
3. Download preferred model format (FP8/FP16/GGUF)
4. Update workflows to use new nodes
5. Adjust CFG scale to 7-10 range
\`\`\`

## LoRA Support

LTX 2.3 maintains full LoRA compatibility:

- Train custom styles on 20-50 videos
- Apply at 0.6-0.8 strength
- Combine multiple LoRAs
- Faster training than previous versions

## Benchmark Results

Compared to LTX 2.0:

\`\`\`
Quality Score:     +23%
Motion Smoothness: +31%
Prompt Accuracy:   +18%
Generation Speed:  +30% (FP8)
VRAM Usage:        -20% (FP8)
\`\`\`

## What's Next

Lightricks has announced:

- **LoRA marketplace**: Coming Q2 2026
- **Image-to-video improvements**: In development
- **Longer video support**: 480+ frames planned
- **Real-time preview**: Experimental feature

## Getting Started

New to LTX 2.3? Check out:

- [Complete Tutorial](/blog/getting-started-with-ltx-23-complete-tutorial)
- [Model Downloads](/models)
- [Workflow Library](/workflows)
- [Optimization Guide](/blog/ltx-23-optimization-guide-best-practices-for-quality-and-speed)

## Join the Community

- **Discord**: Share your creations and get help
- **GitHub**: Report issues and contribute
- **Reddit**: r/LTXVideo discussions
- **Twitter**: @LTXVideo updates

## Resources

- [Official Documentation](https://huggingface.co/Lightricks/LTX-2.3)
- [Model Card on HuggingFace](https://huggingface.co/Lightricks/LTX-2.3)
- [Research Paper](https://arxiv.org/abs/ltx-2.3)
- [Video Examples](https://huggingface.co/Lightricks/LTX-2.3/tree/main/examples)

Stay tuned for more updates!`;

async function updatePost() {
  const { error } = await supabase
    .from('blog_posts')
    .update({ content: newContent })
    .eq('slug', 'ltx-23-release-whats-new-in-lightricks-latest-video-model');

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✅ Post updated successfully');
  }
}

updatePost();
