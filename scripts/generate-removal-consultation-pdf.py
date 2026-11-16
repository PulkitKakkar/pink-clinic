"""Generate the paper form from the same template used online (requires reportlab)."""
import json
from pathlib import Path
import subprocess
import shutil
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

ROOT = Path(__file__).resolve().parents[1]
js = """const fs=require('fs'),ts=require('typescript');const m={exports:{}};new Function('exports','module',ts.transpileModule(fs.readFileSync('lib/admin/templates.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports,m);process.stdout.write(JSON.stringify(m.exports.getConsultationTemplate('tattoo-removal')));"""
t = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
out = ROOT / 'output/pdf/Pink_Clinic_Laser_SPMU_Tattoo_Removal_Consultation.pdf'
out.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(out), pagesize=(595.28, 841.89))
c.setTitle('Pink Clinic - Laser Semi-Permanent Makeup and Tattoo Removal Consultation')
c.setAuthor('Pink Clinic')
sections = {s['title']: s for s in t['sections']}
groups = [
 ['Client details'],
 ['Medical history and suitability screening', 'Treatment-specific screening'],
 ['Tattoo and semi-permanent makeup history', 'Goals and practitioner assessment'],
 ['Information discussed and informed consent'],
 ['Laser assessment and test-patch review'],
 ['Treatment decision and session record', 'Practitioner details'],
]
def clean(v):
 return v.replace('—','-').replace('–','-').replace('’',"'")
def text(v, x, y, width=499, size=10, bold=False):
 c.setFont('Helvetica-Bold' if bold else 'Helvetica',size)
 lines=simpleSplit(clean(v),'Helvetica-Bold' if bold else 'Helvetica',size,width)
 for line in lines:
  c.drawString(x,y,line); y-=size+3
 return y
for page, names in enumerate(groups,1):
 c.setFillColor(HexColor('#ae365d')); c.setFont('Helvetica-Bold',20); c.drawString(48,790,'PINK CLINIC')
 c.setFillColor(HexColor('#222222'))
 text('Laser semi-permanent makeup / tattoo removal',48,765,size=14,bold=True)
 y=text('CONSULTATION, CONSENT & TREATMENT RECORD',48,744,size=9)
 c.setStrokeColor(HexColor('#bdbdbd')); c.line(48,725,547,725)
 y=706
 if page>1:
  y=text('Client name: __________________________________   Date of birth: __________________',48,y,size=9)-10
 for name in names:
  s=sections[name]
  y=text(name.upper(),48,y,size=10,bold=True)-7
  if s.get('description'): y=text(s['description'],48,y,size=9)-5
  for f in s['fields']:
   kind=f['type']; label=f['label']
   if kind in ('yes-no','checkbox'):
    c.setStrokeColor(HexColor('#333333'))
    if kind=='yes-no':
     c.rect(48,y-1,8,8); c.rect(88,y-1,8,8)
     text('Yes',60,y,size=9);text('No',100,y,size=9)
     y=text(label,122,y,width=425,size=9)-8
    else:
     c.rect(48,y-1,8,8); y=text(label,65,y,width=482,size=9)-9
   else:
    if kind in ('select','multi-checkbox'):
     label+=' ('+' / '.join(o['label'] for o in f.get('options',[]))+')'
    y=text(label,48,y,size=9)
    # Generous handwriting space; two ruled lines for longer answers.
    for _ in range(2 if kind=='textarea' and page != 6 else 1):
     y-=9;c.setStrokeColor(HexColor('#bdbdbd'));c.line(48,y,547,y);y-=9
    y-=5
  y-=9
 if page==1:
  y=text('Complete all relevant questions. Tick Yes or No and explain every Yes answer. The practitioner will assess suitability before treatment.',48,y,size=9)
 if page==4:
  y=text('I confirm the information I have provided is accurate. I have discussed my individual treatment plan, risks and questions with the practitioner.',48,y,size=10)-15
  y=text('Client signature: __________________________________   Date: __________________',48,y,size=10)-24
  y=text('Practitioner signature: ______________________________   Date: __________________',48,y,size=10)
 if page==5:
  y=text('Practitioner: confirm the device protocol, training, insurance and eye protection are appropriate for the proposed site. Do not proceed until the test-patch response and any concerns have been assessed.',48,y,size=9)-16
  y=text('Review signature: __________________________________   Date: __________________',48,y,size=10)
 if page==6:
  y=text('Practitioner signature: ______________________________   Date: __________________',48,y,size=10)
 if y<63: raise RuntimeError(f'Page {page} overflows: {y}')
 c.setStrokeColor(HexColor('#bdbdbd'));c.line(48,49,547,49)
 text('Confidential clinical record | Laser removal | Version 16 Nov 2026',48,34,size=8)
 text(f'{page} / {len(groups)}',515,34,size=8)
 c.showPage()
c.save()
shutil.copyfile(out,ROOT/'private/admin-forms'/t['sourceFile'])
print(out)
