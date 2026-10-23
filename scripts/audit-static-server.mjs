// Test-only static server: deliberately mount production files below a repository prefix.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,relative,isAbsolute} from 'node:path';
const root=resolve('dist'),prefix='/geometrical-optics-lab/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const path=resolve(root,decodeURIComponent(url.pathname.slice(prefix.length))||'index.html');
  try{const rel=relative(root,path);if(rel.startsWith('..')||isAbsolute(rel))throw Error('path');const body=await readFile(path);res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}
}).listen(4175,'127.0.0.1',()=>console.log('Audit subpath static server: http://127.0.0.1:4175/geometrical-optics-lab/'));
