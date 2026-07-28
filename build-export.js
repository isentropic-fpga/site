/* =====================================================================
   isentropic — static export build
   ---------------------------------------------------------------------
   This is the SINGLE SOURCE OF TRUTH for the export/ folder.
   Nothing in export/ is edited by hand — it is all generated from the
   .dc.html source pages by this script.

   HOW TO REBUILD: ask Claude to "rebuild the export" — it runs this
   exact logic (readFile/saveFile helpers exist in that build sandbox).

   WHAT IT PRODUCES (into export/):
     index.html, products.html, openjls.html, projects.html, contact.html
       - content baked into the markup (no DC runtime / no JS to render)
       - design-system CSS inlined; {{ }} holes resolved
       - inter-page links rewritten Foo.dc.html -> /foo (extensionless: the
         host serves the clean path and 307s away from the .html spelling)
       - out/ asset paths rewritten to assets/
       - index.html additionally gets a tiny self-contained carousel script
       - <image-slot> plates baked to <img>, or dropped if no photo yet
       - theme.js inlined into <head> so the saved theme applies before paint
     assets/isentropic-wordmark.svg (+ -dark cut), assets/isentropic-icon-512.png
     assets/og-card.png, assets/og-openjls.png (referenced by og:image)
     robots.txt, sitemap.xml
   DEPLOY: upload the CONTENTS of export/ to the web root.
   ===================================================================== */

const DS = '_ds/industry-8df8084b-247a-4c13-b5b0-50b41d41eb2f';
const DOMAIN = 'https://isentropic.com.br';
const dscss = await readFile(DS + '/styles.css');
const sitecss = await readFile('site.css');
/* Inlined rather than shipped as a file: it must run before first paint or the
   page flashes light before the saved dark theme lands. */
const themejs = await readFile('theme.js');

const pages = [
  ['Home.dc.html','index.html'],
  ['Products.dc.html','products.html'],
  ['OpenJLS.dc.html','openjls.html'],
  ['Projects.dc.html','projects.html'],
  ['Contact.dc.html','contact.html'],
];
/* Link targets are the extensionless URLs, not the filenames in `pages` above.
   Cloudflare Workers Assets treats the clean path as canonical and 307s away
   from the .html spelling, so linking to .html would bounce every nav click. */
const linkMap = {
  'Home.dc.html':'/','Products.dc.html':'/products',
  'OpenJLS.dc.html':'/openjls','Projects.dc.html':'/projects','Contact.dc.html':'/contact',
};
const dsLink = '<link rel="stylesheet" href="'+DS+'/styles.css">';
const dsScript = '<script src="'+DS+'/_ds_bundle.js"><\/script>';
const siteLink = '<link rel="stylesheet" href="site.css">';
const themeScript = '<script src="theme.js"><\/script>';

const caroScript = `<script>
(function(){
  /* Scoped to explicit data-caro hooks (not tag/class guesses) and driven by a
     transform on the track, so it cannot be confused by other markup and does
     not depend on scrollLeft inside an overflow:hidden box. */
  var track=document.querySelector('[data-caro="track"]');
  if(!track)return;
  var n=track.children.length; if(n<2)return;
  var counter=document.querySelector('[data-caro="counter"]');
  var dots=document.querySelectorAll('[data-caro="dot"]');
  var prev=document.querySelector('[data-caro="prev"]');
  var next=document.querySelector('[data-caro="next"]');
  var i=0;
  function upd(){
    track.style.transform='translateX('+(-i*100)+'%)';
    for(var x=0;x<dots.length;x++)dots[x].setAttribute('data-on',x===i?'1':'0');
    if(counter)counter.textContent='0'+(i+1)+' / 0'+n;
  }
  function go(x){i=((x%n)+n)%n;upd();}
  if(prev)prev.addEventListener('click',function(){go(i-1);});
  if(next)next.addEventListener('click',function(){go(i+1);});
  for(var x=0;x<dots.length;x++)(function(k){
    dots[k].addEventListener('click',function(){go(k);});
  })(x);
  upd();
})();
<\/script>`;

/* Image plates.
   The .dc.html sources carry <image-slot> drop targets — that is the correct
   AUTHORING state, but a slot cannot resolve on a public server (no editor
   runtime, no sidecar), so it must never reach export/.
   Filled slots are baked to a plain <img>; unfilled ones are dropped whole,
   figure and caption together, and image-slot.js is never shipped. */
let slotState = {};
try { slotState = JSON.parse(await readFile('.image-slots.state.json')); } catch (e) { /* nothing dropped yet */ }
const slotSrc = id => {
  const v = slotState && (slotState[id] ?? slotState?.slots?.[id]);
  if (!v) return null;
  return typeof v === 'string' ? v : (v.src || v.dataUrl || v.image || v.url || null);
};
const HR = '<hr style="height:1px;border:0;background:var(--color-divider);margin:0 var(--edge);">';
/* A wrapper carrying data-plate-section exists only to host its plate: when the
   plate is dropped the wrapper goes with it, so no empty padded band ships.
   data-plate-fallback names what to put back in its place (currently just the
   hairline divider the Home plate replaced). */
const dropPlateSections = html => html.replace(
  /<section[^>]*\bdata-plate-section\b[^>]*>[\s\S]*?<\/section>/g,
  sec => /<img/.test(bakePlates(sec))       // a filled plate survives baking
    ? sec
    : (/data-plate-fallback="hr"/.test(sec) ? '  ' + HR : ''));
const stripPlateAttrs = html => html.replace(/\s*data-plate-section\b/g,'').replace(/\s*data-plate-fallback="[^"]*"/g,'');
const bakePlates = html => html.replace(
  /<figure class="plate-fig">[\s\S]*?<\/figure>/g,
  fig => {
    if (!/<image-slot/.test(fig)) return fig;   // already a baked/authored <img> figure
    const id  = (fig.match(/<image-slot[^>]*\bid="([^"]+)"/) || [])[1];
    const cap = (fig.match(/<figcaption class="plate-cap">([\s\S]*?)<\/figcaption>/) || [])[1] || '';
    const url = id && slotSrc(id);
    if (!url) return '';
    return fig.replace(
      /<image-slot[^>]*><\/image-slot>/,
      '<img src="' + url + '" alt="' + cap.replace(/^Fig\.\s*\d+\s*—\s*/, '').replace(/"/g, '&quot;') +
      '" style="width:100%;height:100%;object-fit:cover;display:block;">'
    );
  });

for (const [src,out] of pages){
  let raw = await readFile(src);
  let inner = raw.slice(raw.indexOf('<x-dc>')+6, raw.indexOf('</x-dc>'));
  let helmet = inner.slice(inner.indexOf('<helmet>')+8, inner.indexOf('</helmet>'));
  let body = inner.slice(inner.indexOf('</helmet>')+9);
  helmet = replaceText(helmet, dsLink, '');
  helmet = replaceText(helmet, dsScript, '');
  helmet = replaceText(helmet, siteLink, '');
  helmet = replaceText(helmet, themeScript, '');
  helmet = replaceText(helmet, '<script src="./image-slot.js"><\/script>', '');
  helmet = replaceText(helmet,'{{ counter }}','01 / 02');
  body = replaceText(body,'{{ counter }}','01 / 02');
  body = replaceText(body,'{{ dot0 }}','1');
  body = replaceText(body,'{{ dot1 }}','0');
  body = body.replace(/\s*onclick="\{\{[^}]*\}\}"/gi,'').replace(/\{\{[^}]*\}\}/g,'');
  const fix = s => {
    s = s.split('src="out/').join('src="assets/').split('href="out/').join('href="assets/');
    // absolute asset URLs (og:image, JSON-LD logo) must follow the same move,
    // or every social preview 404s against a tree that has no out/ directory
    s = s.split(DOMAIN + '/out/').join(DOMAIN + '/assets/');
    for (const [k,v] of Object.entries(linkMap)) s = s.split('"'+k+'"').join('"'+v+'"');
    return s;
  };
  body = stripPlateAttrs(bakePlates(dropPlateSections(body)));
  helmet = fix(helmet); body = fix(body);
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="darkreader-lock">
<style>
${dscss}
${sitecss}
</style>
<script>
${themejs.trim()}
<\/script>
${helmet.trim()}
</head>
<body>
${body.trim()}
${out==='index.html' ? caroScript : ''}
</body>
</html>
`;
  await saveFile('export/'+out, doc);
}

await saveFile('export/assets/isentropic-wordmark.svg', await readFile('out/isentropic-wordmark.svg'));
await saveFile('export/assets/isentropic-wordmark-dark.svg', await readFile('out/isentropic-wordmark-dark.svg'));
await saveFile('export/assets/isentropic-icon-512.png', await readFileBinary('out/isentropic-icon-512.png'));
await saveFile('export/assets/bench-host.jpg', await readFileBinary('out/bench-host.jpg'));
await saveFile('export/assets/bench-pynq.jpg', await readFileBinary('out/bench-pynq.jpg'));
/* The og:image / twitter:image URLs point at these absolutely, so a clean
   build must ship them or every social preview 404s. */
await saveFile('export/assets/og-card.png', await readFileBinary('out/og-card.png'));
await saveFile('export/assets/og-openjls.png', await readFileBinary('out/og-openjls.png'));

await saveFile('export/robots.txt', `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`);

/* Extensionless paths, matching what the host actually serves. The .html
   spelling was used here originally on the theory that it resolves on every
   static host — but Cloudflare Workers Assets (this site's host) does the
   opposite: `html_handling` defaults to auto-trailing-slash, which makes the
   clean path canonical and 307s /products.html -> /products. Listing .html
   here would point the sitemap and canonicals at redirects rather than pages.
   Keep these in step with `linkMap` and the canonical/og:url tags in *.dc.html. */
const routes = [['/',1.0],['/products',0.8],['/openjls',0.8],['/projects',0.6],['/contact',0.5]];
await saveFile('export/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([p,pr])=>`  <url><loc>${DOMAIN}${p}</loc><changefreq>monthly</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);
