# LTX-2.3 Update Checker

Check for new LTX-2.3 model releases and update the project accordingly.

## Steps

1. Fetch the latest file listing from HuggingFace for Lightricks/LTX-2.3 and Kijai/LTX2.3_comfy repositories
2. Read the current `/Users/sunhaoyu/haoyu/CodeX/ltxworkflow/lib/models.ts` to see what models are already listed
3. Compare: identify any new model files not yet in models.ts
4. If new models found:
   - Show the user what's new
   - Ask if they want to update models.ts
   - If yes, update models.ts with the new entries
   - Also update the Guide page if installation instructions changed
5. If nothing new, report "No updates found"

## HuggingFace URLs to check
- https://huggingface.co/api/models/Lightricks/LTX-2.3 (official models)
- https://huggingface.co/api/models/Kijai/LTX2.3_comfy (FP8 variants)

## What to look for
- New .safetensors checkpoint files
- New quantization variants (fp8, gguf, etc.)
- Version bumps in existing filenames (e.g., v3 → v4)
