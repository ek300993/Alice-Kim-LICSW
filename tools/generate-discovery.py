#!/usr/bin/env python3
"""Refresh sitemap and the blog's initial, crawlable article list from posts.json."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import json
import re

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://alicekimlicsw.com'
posts = json.loads((ROOT / 'posts.json').read_text())
urls = [ORIGIN + path for path in ['/', '/about', '/services', '/faq', '/blog']]
urls += [ORIGIN + '/post.html?id=' + quote(post['id'], safe='') for post in posts]
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
xml += ''.join('  <url><loc>' + escape(url) + '</loc></url>\n' for url in urls)
xml += '</urlset>\n'
(ROOT / 'sitemap.xml').write_text(xml)

cards = []
for post in posts:
    url = '/post.html?id=' + quote(post['id'], safe='')
    title = escape(post['title'])
    image = (f'<img src="{escape(post["image"], quote=True)}" alt="{title}" '
             'loading="lazy" decoding="async" class="blog-card-img" '
             'style="width:100%;height:220px;object-fit:cover;">') if post.get('image') else ''
    cards.append(f'''        <article class="card blog-card">
          {image}
          <div style="padding:2rem;">
            <time datetime="{escape(post['date'])}">{escape(post['date'])}</time>
            <h3 class="blog-card-title"><a href="{url}">{title}</a></h3>
            <p>{escape(post.get('author') or 'Alice Kim, LICSW')}</p>
            <a href="{url}" class="blog-card-link">Read Article &rarr;</a>
          </div>
        </article>''')
blog = ROOT / 'blog.html'
text = blog.read_text()
start, end = '<!-- ARTICLE DISCOVERY START -->', '<!-- ARTICLE DISCOVERY END -->'
if start not in text:
    text = text.replace('<!-- Dynamically loaded posts -->\n        <p class="text-center" style="grid-column: 1/-1; opacity: 0.7;">Loading articles...</p>', start + '\n' + end)
text = re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda _: start + '\n' + '\n'.join(cards) + '\n        ' + end, text, flags=re.S)
blog.write_text(text)
print(f'Updated sitemap ({len(urls)} URLs) and blog fallback ({len(posts)} articles).')
