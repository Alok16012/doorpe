"""Download free Wikimedia item photos with attribution, then generate the image map.
Run: python3 scripts/import-item-photos.py
"""
import concurrent.futures, io, json, pathlib, re, subprocess, urllib.parse
from PIL import Image, ImageOps
ROOT = pathlib.Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / 'scripts/item-photo-plan.json').read_text())
DEST = ROOT / 'public/img/items'
DEST.mkdir(parents=True, exist_ok=True)
CACHE = ROOT / 'scripts/item-photo-sources.json'
sources = json.loads(CACHE.read_text()) if CACHE.exists() else {}

def get(url):
    r = subprocess.run(['curl', '-s', '-f', '-L', '--http1.1', '--retry', '2', '--retry-all-errors', '--retry-delay', '1', '--max-time', '12', url], capture_output=True)
    if r.returncode: raise RuntimeError(f'HTTP download failed ({r.returncode}): {url[:150]} {r.stderr.decode()[:100]}')
    return r.stdout

def api(host, **params):
    if 'titles' in params: params['titles'] = params['titles'].replace(' ', '_')
    url = f'https://{host}/w/api.php?' + urllib.parse.urlencode({'action':'query','format':'json', **params}, quote_via=urllib.parse.quote)
    try:
        return json.loads(get(url))
    except RuntimeError:
        return json.loads(get(url + '&uselang=en'))

topics = sorted(set([*PLAN['emoji'].values(), *PLAN['labels'].values()]))
for start in range(0, len(topics), 20):
    batch = [t for t in topics[start:start+20] if t not in sources]
    if not batch: continue
    result = api('en.wikipedia.org', titles='|'.join(batch), redirects=1, prop='pageimages', piprop='thumbnail|name', pithumbsize=500, pilicense='free')
    aliases = {x['from']:x['to'] for x in result.get('query',{}).get('normalized',[]) + result.get('query',{}).get('redirects',[])}
    pages = {p['title']:p for p in result.get('query',{}).get('pages',{}).values()}
    for topic in batch:
        title = topic
        for _ in range(5): title = aliases.get(title,title)
        p = pages.get(title,{})
        thumb = p.get('thumbnail',{}).get('source','').split('?')[0]
        if thumb and not re.search(r'\.(svg|gif|pdf|tif|tiff)(/|$)',thumb,re.I):
            slug = re.sub(r'[^a-z0-9]+','-',topic.lower()).strip('-')
            sources[topic] = {'file':f'{slug}.jpg','url':thumb,'original':p['pageimage'],'article':f'https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(" ","_"))}'}
        else: print('MISSING', topic, flush=True)
    CACHE.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
    print('Resolved',start+len(batch),'/',len(topics),flush=True)

# Explicit photo choices replace diagrams, logos and disambiguation-page images.
for topic, filename in PLAN.get('files', {}).items():
    if topic in sources and sources[topic]['original'].replace('_', ' ') == filename: continue
    result = api('en.wikipedia.org', titles='File:'+filename, prop='imageinfo', iiprop='url', iiurlwidth=500)
    info = next(iter(result['query']['pages'].values())).get('imageinfo', [{}])[0]
    url = info.get('thumburl', info.get('url', '')).split('?')[0]
    if not url: raise SystemExit('No photo: '+filename)
    slug = re.sub(r'[^a-z0-9]+','-',topic.lower()).strip('-')
    existing = DEST / (slug + '.webp')
    if existing.exists(): existing.unlink()
    sources[topic] = {'file':slug+'.jpg','url':url,'original':filename,'article':info.get('descriptionurl','')}
    CACHE.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')

def download(topic):
    s=sources[topic]
    s['file'] = pathlib.Path(s['file']).stem + '.webp'
    path=DEST/s['file']
    if not path.exists():
        try:
            raw=get(s['url'])
        except RuntimeError:
            alternate=re.sub(r'/\d+px-', '/500px-', s['url'].replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/'))
            raw=get(alternate)
        if not raw.startswith(b'\xff\xd8') and not raw.startswith(b'\x89PNG') and raw[:4] != b'RIFF': raise RuntimeError(f'Not a photo: {topic}')
        photo = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB')
        photo.thumbnail((640,640))
        photo.save(path, 'WEBP', quality=85)
    return topic

CACHE.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    futures={pool.submit(download,t):t for t in topics if t in sources}
    for f in concurrent.futures.as_completed(futures):
        try: print('Saved',f.result(),flush=True)
        except Exception as e: print('ERROR',futures[f],str(e),flush=True)

# Keep the Commons author and license alongside every shipped asset.
needs = [t for t in topics if t in sources and not sources[t].get('license')]
for start in range(0,len(needs),5):
    batch = needs[start:start+5]
    result = api('en.wikipedia.org', titles='|'.join('File:'+sources[t]['original'] for t in batch), prop='imageinfo', iiprop='extmetadata|url')
    pages = {p['title']:p for p in result.get('query',{}).get('pages',{}).values()}
    for topic in batch:
        p = pages.get('File:'+sources[topic]['original'].replace('_',' '),{})
        info = p.get('imageinfo',[{}])[0]
        m = info.get('extmetadata',{})
        def val(k): return m.get(k,{}).get('value','')
        sources[topic].update(author=val('Artist'),license=val('LicenseShortName'),licenseUrl=val('LicenseUrl'),credit=val('Credit'),source=info.get('descriptionurl',''))
    CACHE.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
    print('Credits',start+len(batch),'/',len(needs),flush=True)

# These older Commons pages credit authors in page text/file history rather than API metadata.
AUTHOR_OVERRIDES = {'Cheese': 'Dorina Andress; cropped by Neutrality and Foobaz; sharpened by Puffin', 'Cosmetics': 'KaurJmeb; color correction by Jacek Halicki', 'Frozen yogurt': 'stu_spivack', 'Pressure cooking': 'FischX; subsequent edits by Wikinaut'}
for topic, author in AUTHOR_OVERRIDES.items():
    if topic in sources and not sources[topic].get('author'): sources[topic]['author'] = author

missing=[t for t in topics if t not in sources or not (DEST/sources[t]['file']).exists()]
print('UNRESOLVED',json.dumps(missing),flush=True)
if missing: raise SystemExit(1)
for t in topics:
    if not sources[t].get('license'): raise SystemExit('Missing license: '+t)
CACHE.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
output={kind:{key:'/img/items/'+sources[topic]['file'] for key,topic in entries.items()} for kind,entries in PLAN.items() if kind != 'files'}
(ROOT/'lib/item-photos.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
(DEST/'credits.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
