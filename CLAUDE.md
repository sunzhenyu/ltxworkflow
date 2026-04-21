@AGENTS.md

## 检查 LTX-2.3 更新

当用户说"检查更新"或"check updates"时，执行以下步骤：

1. 用 curl 直接抓取 HuggingFace API（不用 WebFetch，WebFetch 对 HuggingFace 不可用）：
   ```bash
   curl -sL --max-time 30 "https://huggingface.co/api/models/Lightricks/LTX-2.3" -o /tmp/ltx23-api.json
   curl -sL --max-time 30 "https://huggingface.co/api/models/Kijai/LTX2.3_comfy" -o /tmp/kijai-api.json
   ```
   如果 curl 也超时（exit 28），说明本地网络无法访问 HuggingFace，改用 WebSearch 搜索最新文件信息。

2. 解析 API 结果：
   ```bash
   python3 -c "
   import json
   data = json.load(open('/tmp/kijai-api.json'))
   files = [s['rfilename'] for s in data.get('siblings',[])]
   for f in files:
       if f.endswith('.safetensors'): print(f)
   "
   ```

3. 读取 `lib/models.ts` 中已有的模型文件名
4. 对比两者，找出新增的 `.safetensors` 文件
5. 如果有新模型：列出新内容，询问是否更新 `models.ts` 和 `app/changelog/page.tsx`
6. 如果没有新内容：报告"No updates found"

## 通用内容生成流程（博客 & Resources）

所有内容生成（博客、Tutorials、Community、Showcase、Research、Tools）共用以下流程：

### 工具脚本位置
所有内容生成脚本位于 `scripts/content-generation/` 目录：
- `extract-article.py` - 提取文章内容
- `extract-media.py` - 提取图片和视频 URL
- `download-media.sh` - 批量下载媒体文件
- `insert-content.js` - 插入/更新数据库
- `README.md` - 详细使用文档

### 抓取内容

> **⚠️ 强制要求：必须完整执行步骤 1-7，不得跳过媒体抓取步骤（步骤 4-6）。即使文章没有图片/视频，也必须运行 extract-media.py 确认后再继续。**

1. 用 WebSearch 搜索主题，**只选 1-2 篇**最权威的来源（不要多）
2. 用 curl 下载完整 HTML 到 `/tmp/article.html`
3. 使用 `extract-article.py` 提取内容：
   ```bash
   python3 scripts/content-generation/extract-article.py /tmp/article.html /tmp/content.md
   ```
   - 自动保留原文段落结构（h1-h4, p, li, code, blockquote）
   - 自动移除营销内容（课程推广、订阅、广告等）
   - 自动过滤导航、页脚等 UI 元素

4. 使用 `extract-media.py` 提取媒体 URL：
   ```bash
   python3 scripts/content-generation/extract-media.py /tmp/article.html > /tmp/media-urls.txt
   ```
   - 自动提取图片和视频 URL
   - 自动过滤 logo、icon、og-image 等 UI 元素

5. 使用 `download-media.sh` 下载媒体文件：
   ```bash
   # 下载图片
   ./scripts/content-generation/download-media.sh /tmp/image-urls.txt public/images/resources/ article-prefix-
   
   # 下载视频
   ./scripts/content-generation/download-media.sh /tmp/video-urls.txt public/videos/resources/ article-prefix-
   ```

6. 在 markdown 中插入媒体：
   - 图片：`![描述](/images/resources/article-prefix-1.jpg)`
   - 视频：`![视频描述](/videos/resources/article-prefix-1.mp4)`
   - **注意**：视频使用图片语法 `![...](...mp4)`，MarkdownContent 组件会自动检测 .mp4/.webm/.mov 扩展名并渲染为 video 标签

7. 生成最终文章：
   - 开头添加英文编者按：`> **Editor's Note:** [简短总结]`
   - 保留原文完整内容和章节结构
   - 文章末尾添加 `## Sources` 章节

### 插入数据库
使用 `insert-content.js` 脚本（已内置去重检查）：

**去重机制**：
- 自动检查 slug 是否已存在
- 自动检查 source_url 是否已被使用
- 如果重复会报错并退出，不会覆盖现有内容

```bash
# 准备数据文件
cat > /tmp/data.json << EOF
{
  "slug": "article-slug",
  "title": "Article Title",
  "excerpt": "Short description",
  "content": "$(cat /tmp/content.md)",
  "tags": ["ltx-2.3", "comfyui"],
  "author_name": "ltx workflow",
  "source_url": "https://...",
  "source_title": "Source Title",
  "is_published": true,
  "seo_title": "SEO Title",
  "seo_description": "SEO Description"
}
EOF

# 插入数据库（会自动检查重复）
node scripts/content-generation/insert-content.js <table> /tmp/data.json

# 或更新已有内容
node scripts/content-generation/insert-content.js <table> <slug> /tmp/data.json
```

### 完整工作流示例
```bash
# 1. 下载 HTML
curl -sL "https://example.com/article" -o /tmp/article.html

# 2. 提取内容
python3 scripts/content-generation/extract-article.py /tmp/article.html /tmp/content.md

# 3. 提取媒体 URL
python3 scripts/content-generation/extract-media.py /tmp/article.html > /tmp/media-urls.txt

# 4. 下载媒体（手动分离图片和视频 URL）
grep -E '\.(jpg|png|gif|webp)' /tmp/media-urls.txt > /tmp/images.txt
grep -E '\.(mp4|webm|mov)' /tmp/media-urls.txt > /tmp/videos.txt
./scripts/content-generation/download-media.sh /tmp/images.txt public/images/resources/ my-article-
./scripts/content-generation/download-media.sh /tmp/videos.txt public/videos/resources/ my-article-

# 5. 编辑 content.md，插入图片和视频引用

# 6. 准备数据并插入数据库
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

# 7. 提交到 git
git add public/images/resources/my-article-* public/videos/resources/my-article-*
git commit -m "feat: add tutorial with media"
git push
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
