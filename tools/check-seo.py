#!/usr/bin/env python3
"""Check canonical URLs, JSON-LD, discovery URLs and inline JavaScript syntax."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, parse_qs
import json
import subprocess
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags=[]; self.scripts=[]; self.script=None; self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); self.tags.append((tag, attrs))
        if tag=='script': self.script=[attrs, '']
    def handle_data(self, data):
        if self.script is not None: self.script[1]+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.script is not None:
            self.scripts.append(self.script); self.script=None

for name in ['index', 'about', 'services', 'faq', 'blog', 'post']:
    page=Page((ROOT / (name+'.html')).read_text())
    if name != 'post':
        canonical=[a['href'] for t,a in page.tags if t=='link' and a.get('rel')=='canonical']
        assert canonical == ['https://alicekimlicsw.com'+('/' if name=='index' else '/'+name)], (name,canonical)
        assert len([a for t,a in page.tags if t=='meta' and a.get('name')=='description'])==1
    for attrs, script in page.scripts:
        if attrs.get('type')=='application/ld+json':
            schema=json.loads(script)
            assert schema['url']=='https://alicekimlicsw.com/'
            assert len(schema['areaServed'])==6
            assert 'openingHours' not in schema
        elif script.strip():
            with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
                f.write(script); f.flush()
                subprocess.run(['node','--check',f.name],check=True,capture_output=True)
posts=json.loads((ROOT/'posts.json').read_text())
expected={'https://alicekimlicsw.com'+path for path in ['/', '/about', '/services', '/faq', '/blog']}
expected.update('https://alicekimlicsw.com/post.html?id='+p['id'] for p in posts)
sitemap=ET.parse(ROOT/'sitemap.xml')
urls=[e.text for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls)==len(set(urls)) and set(urls)==expected
blog=Page((ROOT/'blog.html').read_text())
links={a['href'] for t,a in blog.tags if t=='a' and 'href' in a}
assert all('/post.html?id='+p['id'] in links for p in posts)
all_ids=[p['id'] for p in posts]+[alias for p in posts for alias in p.get('aliases',[])]
assert len(all_ids)==len(set(all_ids))
for old,target in {'home-2':'/','about-2':'/about','services-2':'/services','faq-2':'/faq'}.items():
    page=Page((ROOT/(old+'.html')).read_text())
    assert any(t=='meta' and a.get('http-equiv')=='refresh' and a['content']=='0; url='+target for t,a in page.tags)
print('PASS: six pages, JSON-LD, inline JS, nine sitemap URLs, four fallback article links, four legacy redirects.')
