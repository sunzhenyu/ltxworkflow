#!/usr/bin/env python3
"""
Extract article content from HTML, preserving structure and removing marketing content.
Usage: python3 extract-article.py <html_file> [output_file]
"""

import sys
import re
from html.parser import HTMLParser

class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_h1 = False
        self.in_h2 = False
        self.in_h3 = False
        self.in_h4 = False
        self.in_p = False
        self.in_li = False
        self.in_code = False
        self.in_pre = False
        self.in_blockquote = False
        self.skip_tags = ['nav', 'footer', 'aside', 'script', 'style', 'header', 'form', 'button']
        self.skip_depth = 0
        self.content = []
        self.current_text = []

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip_depth += 1
            return
        if self.skip_depth > 0:
            return

        if tag == 'h1':
            self.in_h1 = True
        elif tag == 'h2':
            self.in_h2 = True
        elif tag == 'h3':
            self.in_h3 = True
        elif tag == 'h4':
            self.in_h4 = True
        elif tag == 'p':
            self.in_p = True
        elif tag == 'li':
            self.in_li = True
        elif tag == 'code':
            self.in_code = True
        elif tag == 'pre':
            self.in_pre = True
        elif tag == 'blockquote':
            self.in_blockquote = True

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip_depth = max(0, self.skip_depth - 1)
            return
        if self.skip_depth > 0:
            return

        text = ''.join(self.current_text).strip()

        if tag == 'h1' and self.in_h1 and len(text) > 5:
            self.content.append(f'\n# {text}\n')
            self.current_text = []
            self.in_h1 = False
        elif tag == 'h2' and self.in_h2 and len(text) > 5:
            self.content.append(f'\n## {text}\n')
            self.current_text = []
            self.in_h2 = False
        elif tag == 'h3' and self.in_h3 and len(text) > 5:
            self.content.append(f'\n### {text}\n')
            self.current_text = []
            self.in_h3 = False
        elif tag == 'h4' and self.in_h4 and len(text) > 5:
            self.content.append(f'\n#### {text}\n')
            self.current_text = []
            self.in_h4 = False
        elif tag == 'p' and self.in_p and text:
            self.content.append(f'{text}\n\n')
            self.current_text = []
            self.in_p = False
        elif tag == 'li' and self.in_li and text:
            self.content.append(f'- {text}\n')
            self.current_text = []
            self.in_li = False
        elif tag == 'pre' and self.in_pre:
            if text:
                self.content.append(f'```\n{text}\n```\n\n')
            self.current_text = []
            self.in_pre = False
        elif tag == 'blockquote' and self.in_blockquote:
            if text:
                self.content.append(f'> {text}\n\n')
            self.current_text = []
            self.in_blockquote = False
        elif tag == 'code' and self.in_code:
            self.in_code = False

    def handle_data(self, data):
        if self.skip_depth > 0:
            return
        if any([self.in_h1, self.in_h2, self.in_h3, self.in_h4,
                self.in_p, self.in_li, self.in_code, self.in_pre, self.in_blockquote]):
            self.current_text.append(data)

def remove_marketing_content(content):
    """Remove marketing and promotional content"""
    marketing_patterns = [
        r'Subscribe.*?newsletter.*?\n+',
        r'Join \d+.*?students.*?\n+',
        r'Ready to.*?\?.*?\n+',
        r'Sign up.*?free.*?\n+',
        r'Get started.*?today.*?\n+',
        r'Try.*?for free.*?\n+',
        r'Limited time offer.*?\n+',
        r'Early.*?bird.*?pricing.*?\n+',
        r'Enroll now.*?\n+',
        r'Download.*?free.*?guide.*?\n+',
        r'\[.*?Subscribe.*?\].*?\n+',
        r'\[.*?Sign up.*?\].*?\n+',
    ]

    for pattern in marketing_patterns:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE|re.DOTALL)

    return content

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-article.py <html_file> [output_file]")
        sys.exit(1)

    html_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()

    parser = ArticleParser()
    parser.feed(html)
    content = ''.join(parser.content)

    # Remove marketing content
    content = remove_marketing_content(content)

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Content extracted to {output_file}")
    else:
        print(content)

if __name__ == '__main__':
    main()
