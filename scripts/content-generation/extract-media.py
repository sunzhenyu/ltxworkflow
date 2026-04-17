#!/usr/bin/env python3
"""
Extract image and video URLs from HTML.
Usage: python3 extract-media.py <html_file>
"""

import sys
import re
from html.parser import HTMLParser

class MediaExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.videos = []
        self.in_video = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == 'img' and 'src' in attrs_dict:
            src = attrs_dict['src']
            # Filter out logos, icons, and common UI elements
            if not any(x in src.lower() for x in ['logo', 'icon', 'avatar', 'favicon', 'og-image', 'twitter-card']):
                self.images.append(src)

        elif tag == 'video':
            self.in_video = True
            if 'src' in attrs_dict:
                self.videos.append(attrs_dict['src'])

        elif tag == 'source' and self.in_video and 'src' in attrs_dict:
            self.videos.append(attrs_dict['src'])

    def handle_endtag(self, tag):
        if tag == 'video':
            self.in_video = False

def extract_media_from_html(html):
    """Extract media URLs using both parser and regex"""
    extractor = MediaExtractor()
    extractor.feed(html)

    # Also use regex to catch any missed URLs
    img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
    video_pattern = r'<(?:video|source)[^>]+src=["\']([^"\']+)["\']'

    regex_images = re.findall(img_pattern, html)
    regex_videos = re.findall(video_pattern, html)

    # Combine and deduplicate
    all_images = list(set(extractor.images + regex_images))
    all_videos = list(set(extractor.videos + regex_videos))

    # Filter images (remove logos, icons, etc.)
    filtered_images = [
        img for img in all_images
        if not any(x in img.lower() for x in ['logo', 'icon', 'avatar', 'favicon', 'og-image', 'twitter-card', 'opengraph'])
    ]

    return filtered_images, all_videos

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-media.py <html_file>")
        sys.exit(1)

    html_file = sys.argv[1]

    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()

    images, videos = extract_media_from_html(html)

    print("=== IMAGES ===")
    for i, img in enumerate(images, 1):
        print(f"{i}. {img}")

    print(f"\n=== VIDEOS ===")
    for i, vid in enumerate(videos, 1):
        print(f"{i}. {vid}")

    print(f"\nTotal: {len(images)} images, {len(videos)} videos")

if __name__ == '__main__':
    main()
