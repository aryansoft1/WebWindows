import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const code=readFileSync(new URL('../inc/news-html.asp',import.meta.url),'utf8').replace(/^\uFEFF?<%/,'').replace(/%>\s*$/,'');
const q=value=>'"'+value.replaceAll('"','""')+'"';
const cases=[
 ['<h1>Title</h1><p style="text-align:center;color:#123456;font-size:24px;font-family:Georgia">Body</p>', /<h1>Title<\/h1>/, /text-align:center;color:#123456;font-size:24px;font-family:Georgia/],
 ['<p onclick="evil()">Keep<script>alert(1)</script><img src="data:image/png;base64,x" onerror="evil()"><a href="javascript:alert(1)">Link</a></p>', /Keep/, /<a rel="noopener noreferrer">Link<\/a>/],
 ['<table><tbody><tr><th colspan="2">Heading</th></tr><tr><td>One</td><td>Two</td></tr></tbody></table><img src="https://example.com/a.png" alt="A &amp; B" width="300">', /<th colspan="2">Heading/, /alt="A &amp; B" width="300"/],
 ['<span style="background-image:url(javascript:x);position:fixed;color:rgb(300,0,0);font-size:99px;margin-left:999px">Safe</span>', /^<span>Safe<\/span>$/],
 ['<a href="java&#115;cript:x" onclick="evil()">x</a><svg><a href="https://evil.com">bad</a></svg>', /^<a rel="noopener noreferrer">x<\/a>$/],
 ['<img src="https://example.com/x" onerror="x" alt="&quot; onload=&quot;bad"><p style="color:#fff; text-decoration:line-through">OK</p>', /alt="&quot; onload=&quot;bad"/, /text-decoration:line-through/],
 ['<p title="x > y">Text &lt;script&gt;</p><iframe src="https://evil.com">drop</iframe>', /^<p>Text &lt;script&gt;<\/p>$/],
 ['<a href="https://example.com/?x=1&amp;y=2">query</a>', /href="https:\/\/example.com\/\?x=1&amp;y=2"/],
 ['<script>only malicious</script>', /^$/],
 ['<td colspan="9999" style="font-family:expression(x)">x</td>', /^<td>x<\/td>$/]
];
const source=code+'\n'+cases.map(([input],i)=>'WScript.Echo '+q(String(i)+':')+' & NewsHtmlSanitize('+q(input)+')').join('\n')+'\nWScript.Echo "EMPTY:" & CStr(NewsHtmlHasContent(NewsHtmlSanitize("<p><br></p>")))\n';
if (process.argv[2] === '--emit') {
 writeFileSync(process.argv[3],source.replaceAll('\n','\r\n'),'utf8');
} else if (process.argv[2] === '--verify') {
 const output=readFileSync(process.argv[3],'utf8').replace(/^\uFEFF/,'');
 const lines=output.trim().split(/\r?\n/);
 cases.forEach(([, ...patterns],i)=>{const value=lines.find(line=>line.startsWith(i+':'))?.slice(String(i).length+1);assert.notEqual(value,undefined);for(const pattern of patterns) assert.match(value,pattern);assert.doesNotMatch(value,/<(?:script|iframe|svg)|\son(?:error|click)=|href="javascript:/i);});
 assert.ok(lines.includes('EMPTY:False'));console.log('news HTML runtime passed: allowed format, tables/images, CSS/URL/script rejection, empty-body guard');
} else {throw new Error('Run tests/news-html-runtime-smoke.ps1');}
