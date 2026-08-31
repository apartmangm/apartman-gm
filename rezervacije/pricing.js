(function(){
'use strict';
const FULL={1:100,2:100,3:110,4:110,5:110,6:120,7:120,8:130,9:140,10:150,11:157,12:163,13:169};
const P={'Soba broj 1.':[20,25,30,null],'Soba broj 2.':[25,29,null,null],'Soba broj 3.':[29,33,37,42],'Soba broj 4.':[29,33,39,44]};
const $=id=>document.getElementById(id), num=v=>Math.max(0,Number(v)||0);
function nights(){let a=$('ci')?.value,b=$('co')?.value;return a&&b?Math.max(0,Math.round((new Date(b)-new Date(a))/86400000)):0}
function guests(){return num($('ad')?.value)+num($('ch')?.value)}
function rooms(acc){let s=String(acc||'').toLowerCase();if(s.includes('120 m²')||s.includes('120 m2'))return[1,2,3,4];if(s.includes('90 m²')||s.includes('90 m2'))return[2,3,4];let m=s.match(/soba\s*1\s*\+\s*soba\s*2/);if(m)return[1,2];m=s.match(/soba\s*2\s*\+\s*soba\s*3/);if(m)return[2,3];m=s.match(/soba\s*3\s*\+\s*soba\s*4/);if(m)return[3,4];m=s.match(/soba\s*broj\s*([1-4])/);return m?[+m[1]]:[]}
function nightly(){let acc=$('acc')?.value,p=guests(),rs=rooms(acc);if(!acc||!p||!rs.length)return null;if(rs.length===1)return P['Soba broj '+rs[0]+'.']?.[p-1]??null;if((acc||'').includes('120 m²')||(acc||'').includes('120 m2'))return FULL[p]??null;
/* For two/three rooms, use the sum of each room's regular rate. Guests are allocated as evenly as possible; premium room differences remain reflected. */
let best=null;function walk(i,left,sum){if(i===rs.length){if(left===0&&(best===null||sum<best))best=sum;return}let a=P['Soba broj '+rs[i]+'.'];for(let q=1;q<=4&&q<=left;q++){let v=a?.[q-1];if(v!=null)walk(i+1,left-q,sum+v)}}walk(0,p,0);return best}
function factor(i){return i===1?1:i===2?.90:i===3?.80:i===4?.73:i===5?.67:i===6?.61:.56}
function total(){let one=nightly(),n=nights();if(one==null||!n)return one;let t=0;for(let i=1;i<=n;i++)t+=one*factor(i);return Math.round(t*100)/100}
function calc(){let reg=total(),special=num($('special')?.value),type=$('ptype')?.value,total=type==='special'&&special>0?special:reg;if($('regular'))$('regular').value=reg==null?'':reg.toFixed(2);if($('total'))$('total').value=total==null?'':total.toFixed(2);let pct=num($('pct')?.value);if($('dep'))$('dep').value=total==null?'':(total*pct/100).toFixed(2);if($('bal'))$('bal').value=total==null?'':(total-num($('dep')?.value)).toFixed(2);if($('priceInfo'))$('priceInfo').innerHTML=reg==null?'Za ovu kombinaciju još nije postavljena automatska redovna cijena. Možeš ručno unijeti posebnu ponudu.':'<b>Redovna cijena:</b> '+reg.toFixed(2)+' €'+(nights()>1?'<div class="savehint">Cijena za više noćenja automatski uključuje dogovorenu pogodnost.</div>':'')}
window.priceFor=nightly;window.priceCalc=calc;window.GMPriceEngine={update:calc,regularTotal:total,oneNightRegular:nightly};
function start(){['ad','ch','bb','ci','co','acc','ptype','special','pct'].forEach(id=>$(id)?.addEventListener('input',calc));['ci','co','acc','ptype'].forEach(id=>$(id)?.addEventListener('change',calc));calc()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();