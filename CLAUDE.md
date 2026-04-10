@AGENTS.md

## 检查 LTX-2.3 更新

当用户说"检查更新"或"check updates"时，执行以下步骤：

1. 用 WebFetch 抓取 HuggingFace API：
   - `https://huggingface.co/api/models/Lightricks/LTX-2.3` (官方模型)
   - `https://huggingface.co/api/models/Kijai/LTX2.3_comfy` (FP8 变体)
2. 读取 `lib/models.ts` 中已有的模型文件名
3. 对比两者，找出新增的 `.safetensors` 文件
4. 如果有新模型：列出新内容，询问是否更新 `models.ts` 和 `app/changelog/page.tsx`
5. 如果没有新内容：报告"No updates found"
