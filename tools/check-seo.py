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

PAGES = ['index', 'about', 'services', 'locations', 'faq', 'blog', 'post', 'life-transitions-counseling', 'therapy-professionals-high-performance', 'retirement-transition-therapy', 'therapy-cambridge-harvard-square', 'therapy-brookline', 'walk-and-talk-therapy', 'online-therapy', 'asian-american-therapist', 'anxiety-stress-burnout-therapy']
for name in PAGES:
    page=Page((ROOT / (name+'.html')).read_text())
    if name != 'post':
        canonical=[a['href'] for t,a in page.tags if t=='link' and a.get('rel')=='canonical']
        assert canonical == ['https://alicekimlicsw.com'+('/' if name=='index' else '/'+name)], (name,canonical)
        assert len([a for t,a in page.tags if t=='meta' and a.get('name')=='description'])==1
    footer=(ROOT / (name+'.html')).read_text().split('<footer>')[1]
    assert '22 Hilliard St' in footer and 'Cambridge, MA 02138' in footer, name
    assert '1101 Beacon Street' in footer and 'Brookline, MA 02446' in footer, name
    assert 'Suite' not in footer, name
    assert '7:00 a.m.' in footer, name
    for label in ['Professionals in High Performing Environments', 'Anxiety, Depression, ADHD, Stress', 'Asian American and Immigrant Experiences']:
        assert label in footer, (name, label)
    for route in ['life-transitions-counseling','therapy-professionals-high-performance','retirement-transition-therapy','therapy-cambridge-harvard-square','therapy-brookline','walk-and-talk-therapy','online-therapy','asian-american-therapist','anxiety-stress-burnout-therapy']:
        assert 'href="/'+route+'"' in footer, (name,route)
    for attrs, script in page.scripts:
        if attrs.get('type')=='application/ld+json':
            schema=json.loads(script)
            assert schema['url']=='https://alicekimlicsw.com/'
            assert len(schema['areaServed'])==6
            hours = schema['openingHoursSpecification'][0]
            assert hours['dayOfWeek'] == ['Monday','Tuesday','Wednesday','Thursday']
            assert (hours['opens'], hours['closes']) == ('07:00', '15:00')
            assert {p['address']['addressLocality'] for p in schema['location']} == {'Cambridge','Brookline'}
        elif script.strip():
            with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
                f.write(script); f.flush()
                subprocess.run(['node','--check',f.name],check=True,capture_output=True)
posts=json.loads((ROOT/'posts.json').read_text())
expected={'https://alicekimlicsw.com'+path for path in ['/', '/about', '/services', '/locations', '/faq', '/blog', '/life-transitions-counseling', '/therapy-professionals-high-performance', '/retirement-transition-therapy', '/therapy-cambridge-harvard-square', '/therapy-brookline', '/walk-and-talk-therapy', '/online-therapy', '/asian-american-therapist', '/anxiety-stress-burnout-therapy']}
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
for name in [p.name for p in ROOT.glob('*.html')] + ['posts.json', 'sitemap.xml']:
    assert 'cdn.marblism.com' not in (ROOT/name).read_text(), name
    assert 'virtual' not in (ROOT/name).read_text().lower(), name
for name in PAGES:
    text = (ROOT/(name+'.html')).read_text()
    # Every banner heading is left-aligned, so all five read the same way.
    assert text.count('class="banner-header"') == 0, name
    for _, attrs in Page(text).tags:
        if attrs.get('name') == 'description':
            assert len(attrs['content']) <= 160, (name, len(attrs['content']))
# No single asset is heavy enough to hold up a page.
for a in (ROOT/'Assets').iterdir():
    if a.is_file():
        assert a.stat().st_size < 600_000, (a.name, a.stat().st_size)
for page_name in PAGES:
    for tag, attrs in Page((ROOT/(page_name+'.html')).read_text()).tags:
        src = attrs.get('src', '') if tag == 'img' else ''
        if src.startswith('Assets/'):
            size = (ROOT/src).stat().st_size
            assert size < 600_000, (page_name, src, size)

print(f'PASS: sixteen pages, JSON-LD, office hours, inline JS, {len(urls)} sitemap URLs, four fallback article links, four legacy redirects, self-hosted blog photos, left-aligned banners, no asset over 600 KB.')
