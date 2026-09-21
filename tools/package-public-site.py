#!/usr/bin/env python3
"""Package only intended public website files; never planning documents."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import re,json

ROOT=Path(__file__).resolve().parents[1]
PAGES=['index','about','services','faq','blog','post','home-2','about-2','services-2','faq-2',
       'therapy-cambridge-harvard-square','online-therapy','asian-american-therapist','anxiety-stress-burnout-therapy']
files={Path(name+'.html') for name in PAGES}
files.update(map(Path,['styles.css','script.js','cms.js','article-seo.js','posts.json','robots.txt','sitemap.xml','CNAME']))
for path in list(files):
    text=(ROOT/path).read_text()
    for asset in re.findall(r'''Assets/[^\s"'<>\)]+''',text):
        asset=asset.replace('&amp;','&')
        if (ROOT/asset).is_file(): files.add(Path(asset))
out=ROOT/'output/website';out.mkdir(parents=True,exist_ok=True)
dest=out/'alice-kim-public-site.zip'
with ZipFile(dest,'w',ZIP_DEFLATED) as z:
    for path in sorted(files):z.write(ROOT/path,path.as_posix())
with ZipFile(dest) as z:
    assert all(not n.startswith(('output/','tmp/','Old Site/','.git/')) for n in z.namelist())
    assert all(not n.endswith(('.docx','.pdf','.py')) for n in z.namelist())
(out/'manifest.json').write_text(json.dumps({'files':[str(p) for p in sorted(files)],'deployed':False},indent=2))
print(f'{dest}: {len(files)} files, {dest.stat().st_size:,} bytes; not deployed.')
