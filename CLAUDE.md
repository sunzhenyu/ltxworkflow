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

## 添加博客文章

当用户说以下任何一个触发词时：
- "create blog"
- "add blog"
- "添加博客"
- "写博客"
- "生成博客"

执行以下步骤：

1. 询问用户选择分类：Tutorial, Comparison, Guide, Tips, News
2. 根据分类自动生成合适的标题（关于 LTX 2.3 的内容）
   - 可以参考 https://ltx.studio/blog 的文章风格和主题
   - 标题应该实用、具体、吸引人
3. 执行命令生成文章：
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=https://zivfvqaodrdfdifdashi.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmZ2cWFvZHJkZmRpZmRhc2hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU0MjY5OSwiZXhwIjoyMDkxMTE4Njk5fQ.HhjiE78YelQZoigSKJTsb67dFZtfOuFC1mK9IaUkDcU
   node skills/create-blog-post.js "生成的标题" Category
   ```
4. 报告生成结果和访问链接


