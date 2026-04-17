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

## 通用内容生成流程（博客 & Resources）

所有内容生成（博客、Tutorials、Community、Showcase、Research、Tools）共用以下流程：

### 抓取内容
1. 用 WebSearch 搜索主题，**只选 1-2 篇**最权威的来源（不要多）
2. 用 curl 下载完整 HTML 到 `/tmp/article.html`
3. 用 Python HTMLParser 解析，保留原文的段落结构：
   ```python
   # 解析 h2, h3, p, li, code 标签
   # 保留段落、列表、代码块的原始结构
   # 输出为格式化的 markdown
   ```
4. 处理图片和视频：
   - 提取原文中的图片 URL（排除 logo、广告）
   - 提取原文中的视频 URL（mp4、webm 等格式）
   - 下载到 `public/images/resources/` 或 `public/videos/resources/` 目录
   - 在 markdown 中插入：
     - 图片：`![描述](/images/resources/filename.ext)`
     - 视频：使用 HTML5 video 标签或提供下载链接
5. 移除营销内容：
   - 课程推广（"Join X students", "Early-bird pricing"）
   - 产品广告
   - 社交媒体分享按钮文字
6. 生成最终文章：
   - 开头添加英文编者按：`> **Editor's Note:** [简短总结]`
   - 保留原文完整内容和章节结构
   - 文章末尾添加 `## Sources` 章节

### 插入数据库
写临时 Node.js 脚本到 `scripts/` 目录，执行后删除：
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://zivfvqaodrdfdifdashi.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmZ2cWFvZHJkZmRpZmRhc2hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU0MjY5OSwiZXhwIjoyMDkxMTE4Njk5fQ.HhjiE78YelQZoigSKJTsb67dFZtfOuFC1mK9IaUkDcU
node scripts/insert-content.js && rm scripts/insert-content.js
```

---

## 添加博客文章

触发词：`create blog` / `add blog` / `添加博客` / `写博客` / `生成博客`

1. **自主选择分类**（随机，不询问用户）：Tutorial, Guide, Tips, Comparison, News, Deep Dive, Case Study, FAQ
2. 自主决定关于 LTX 2.3 的具体主题和标题
3. 按通用流程抓取内容并生成文章
4. 插入 `blog_posts` 表，字段：
   ```js
   { slug, title, excerpt, content, category, tags, author_name: 'ltx workflow',
     read_time_minutes: 5, published_at: new Date().toISOString(), is_published: true,
     seo_title, seo_description }
   ```
5. 报告访问链接：`https://ltxworkflow.com/blog/{slug}`

---

## 添加 Tutorials

触发词：`add tutorial` / `添加教程`

1. 自主决定一个 LTX 2.3 实操教程主题
2. 按通用流程抓取内容并生成文章
3. 插入 `tutorials` 表，字段：
   ```js
   { slug, title, excerpt, content, tags, author_name: 'ltx workflow',
     source_url, source_title, source_published_at,
     is_published: true, seo_title, seo_description }
   ```
4. 报告访问链接：`https://ltxworkflow.com/resources/tutorials/{slug}`

---

## 添加 Community

触发词：`add community` / `添加社区`

1. 用 WebSearch 搜索 Reddit/Discord 上关于 LTX 2.3 的热门讨论
2. 按通用流程抓取内容并整理成摘要文章
3. 插入 `community` 表，字段同 tutorials
4. 报告访问链接：`https://ltxworkflow.com/resources/community/{slug}`

---

## 添加 Showcase

触发词：`add showcase` / `添加案例`

1. 用 WebSearch 搜索 LTX 2.3 优秀视频生成案例
2. 按通用流程整理成展示文章（描述生成效果、使用的参数/工作流）
3. 插入 `showcase` 表，字段同 tutorials
4. 报告访问链接：`https://ltxworkflow.com/resources/showcase/{slug}`

---

## 添加 Research

触发词：`add research` / `添加论文`

1. 用 WebSearch 搜索 arxiv 上关于 LTX / 视频生成的最新论文
2. 按通用流程生成论文解读文章（摘要、核心贡献、与 LTX 2.3 的关联）
3. 插入 `research` 表，字段同 tutorials，`source_published_at` 用论文发布日期
4. 报告访问链接：`https://ltxworkflow.com/resources/research/{slug}`

---

## 添加 Tools

触发词：`add tool` / `添加工具`

1. 用 WebSearch 搜索 ComfyUI 节点、插件或 LTX 2.3 相关工具
2. 按通用流程生成工具介绍文章（功能、安装方式、使用场景）
3. 插入 `tools` 表，字段同 tutorials
4. 报告访问链接：`https://ltxworkflow.com/resources/tools/{slug}`
