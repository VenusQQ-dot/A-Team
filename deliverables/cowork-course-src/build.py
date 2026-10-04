import pathlib
d=pathlib.Path(__file__).parent
t=(d/'template.html').read_text(encoding='utf-8')
css=''.join((d/f).read_text(encoding='utf-8') for f in ['style.css','reader.css','skins.css'])
js='\n'.join((d/f).read_text(encoding='utf-8') for f in ['data.js','sim.js','course.js','map.js','gloss.js'])
assert '</script' not in js.lower()
out=t.replace('/*CSS*/',css).replace('/*JS*/',js)
dst=d.parent/'claude-cowork-basics.html'
dst.write_text(out,encoding='utf-8')
print(dst,len(out)//1024,'KB')
