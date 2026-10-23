import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const file of await readdir('src'))if(file.endsWith('.js')){const result=spawnSync(process.execPath,['--check',`src/${file}`],{encoding:'utf8'});if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}}
const source=(await Promise.all((await readdir('src')).filter(f=>/\.(js|css)$/.test(f)).map(f=>readFile(`src/${f}`,'utf8')))).join('\n')+await readFile('index.html','utf8');
for(const forbidden of [/SP025/i,/Semester\s*\d/i,/Chapter\s*\d/i,/Topic\s*\d/i,/Subtopic\s*\d/i])if(forbidden.test(source))throw Error('A prohibited curriculum label was found in the presentation layer.');
console.log('JavaScript syntax and presentation label checks passed.');
