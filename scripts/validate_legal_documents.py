#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'frontend/public/legal'
langs=('fr','en','es')
slugs=('terms','privacy','dpa','cookies','community','safety','kyc','wallet','retention','deletion','copyright','intellectual-property','law-enforcement','acceptable-use','anti-fraud','anti-scam','aml','sanctions','children-protection','transparency')
errors=[]
for lang in langs:
 for slug in slugs:
  for ext in ('md','html','pdf'):
   path=base/lang/f'{slug}.{ext}'
   if not path.exists() or path.stat().st_size<500: errors.append(f'missing/short: {path.relative_to(ROOT)}'); continue
   data=path.read_bytes()
   if ext=='pdf':
    if not data.startswith(b'%PDF-1.4') or b'%%EOF' not in data or b'Page 1 /' not in data: errors.append(f'invalid PDF: {path.relative_to(ROOT)}')
   else:
    text=data.decode('utf-8')
    for required in ('2.0','7 June 2026','Nexa Inc SARL','+243994813049','nexaincdrc.com'):
     if required not in text: errors.append(f'{path.relative_to(ROOT)} missing {required}')
if errors:
 print('\n'.join(errors)); sys.exit(1)
print(f'Validated {len(langs)*len(slugs)} policies in 3 languages with Markdown, HTML, and paginated PDF editions.')
