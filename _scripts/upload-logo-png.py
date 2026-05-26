"""Upload PNG logo to Supabase Storage preserving transparency."""
import os, sys, ssl, json
from pathlib import Path
import urllib.request, urllib.error

# Load .env
env = {}
for line in Path('.env').read_text().splitlines():
    if '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip()

SUPABASE_URL = env['SUPABASE_URL'].rstrip('/')
SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
BUCKET = 'partner-images'
STORAGE_PATH = 'partner-logos/albufeira-surf-sup.png'
SOURCE = '_diag/asup-logo-processed.png'

logo_bytes = Path(SOURCE).read_bytes()
print(f'Source: {SOURCE} ({len(logo_bytes)} bytes, {len(logo_bytes)//1024}KB)')

upload_url = f'{SUPABASE_URL}/storage/v1/object/{BUCKET}/{STORAGE_PATH}'
headers = {
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'image/png',
    'x-upsert': 'true',
    'Cache-Control': '31536000',
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(upload_url, data=logo_bytes, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as resp:
        body = resp.read().decode()
        print(f'Upload OK: HTTP {resp.status}')
        data = json.loads(body)
        print(f'Storage key: {data.get("Key", "?")}')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'Upload FAIL: HTTP {e.code}')
    print(body[:400])
    sys.exit(1)
