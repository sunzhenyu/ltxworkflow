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
2. 根据分类和主题，用 WebSearch 搜索相关权威内容（英文搜索词），找到 3-5 个高质量来源
3. 用 `curl -s "URL" | python3 -c "import sys,re; html=sys.stdin.read(); text=re.sub(r'<[^>]+>',' ',re.sub(r'<script.*?</script>','',re.sub(r'<style.*?</style>','',html,flags=re.DOTALL),flags=re.DOTALL)); print(re.sub(r'\s+',' ',text).strip()[:5000])"` 抓取每个来源的正文内容
4. 基于真实抓取的内容，生成高质量文章，要求：
   - 内容准确、有深度，基于真实数据
   - 文章末尾必须有 "## Sources" 章节，列出所有参考来源的标题和链接（Markdown 格式）
   - 标题实用、具体、包含目标关键词
5. 写一个临时 Node.js 脚本直接插入 Supabase，执行后删除脚本：
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=https://zivfvqaodrdfdifdashi.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmZ2cWFvZHJkZmRpZmRhc2hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU0MjY5OSwiZXhwIjoyMDkxMTE4Njk5fQ.HhjiE78YelQZoigSKJTsb67dFZtfOuFC1mK9IaUkDcU
   node /tmp/insert-blog-post.js
   ```
6. 报告生成结果和访问链接


