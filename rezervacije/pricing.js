(function(){
  'use strict';
  const FULL={1:100,2:100,3:110,4:110,5:110,6:120,7:120,8:130,9:140,10:150,11:157,12:163,13:169};
  const P={
    'Soba broj 1.':[20,25,30,null],
    'Soba broj 2.':[25,29,null,null],
    'Soba broj 3.':[29,33,37,42],
    'Soba broj 4.':[29,33,39,44]
  };
  const get=id=>document.getElementById(id);
  const n=v=>Math.max(0,Number(v)||0);
  const nights=()=>{const a=get('ci')?.value,b=get('co')?.value;if(!a||!b)return 0;return Math.max(0,Math.round((new Date(b)-new Date(a))/86400000));};
  const people=()=>Math.max(0,n(get('ad')?.value)+n(get('ch')?.value));
  const rooms=x=>{const s=String(x||'').toLowerCase();
    if(s.includes('120 m²')||s.includes('120 m2'))return[1,2,3,4];
    if(s.includes('90 m²')||s.includes('90 m2'))return[2,3,4];
    let m=s.match(/soba\s*1\s*\+\s*soba\s*2/);if(m)return[1,2];
    m=s.match(/soba\s*2\s*\+\s*soba\s*3/);if(m)return[2,3];
    m=s.match(/soba\s*3\s*\+\s*soba\s*4/);if(m)return[3,4];
    m=s.match(/soba\s*broj\s*([1-4])/);if(m)return[+m[1]];
    return[];
  };
  const discountForNight=i=>i===1?0:i===2?0.10:i===3?0.20:i===4?0.27:i===5?0.33:i===6?0.39:0.44;
  function oneNightRegular(){
    const acc=get('acc')?.value,p=people(),rs=rooms(acc);
    if(!acc||!p||!rs.length)return null;
    if(rs.length===1)return P['Soba broj '+rs[0]+'.']?.[p-1]??null;
    if((acc||'').includes('120 m²')||(acc||'').includes('120 m2'))return FULL[p]??null;
    let best=null;
    function walk(i,left,sum){
      if(i===rs.length){if(left===0&&(best==null||sum<best))best=sum;return;}
      const arr=P['Soba broj '+rs[i]+'.'];if(!arr)return;
      for(let q=1;q<=4;q++){if(left-q<0)break;const v=arr[q-1];if(v!=null)walk(i+1,left-q,sum+v);}
    }
    walk(0,p,0);return best;
  }
  function regularTotal(){
    const one=oneNightRegular(),ns=nights();
    if(one==null||!ns)return one==null?null:one;
    let total=0;for(let i=1;i<=ns;i++)total+=one*(1-discountForNight(i));
    return Math.round(total*100)/100;
  }
  function update(){
    const reg=regularTotal();
    if(get('regular'))get('regular').value=reg==null?'':reg.toFixed(2);
    const type=get('ptype')?.value||'regular',special=n(get('special')?.value),total=type==='special'&&special>0?special:reg;
    if(get('total'))get('total').value=total==null?'':Number(total).toFixed(2);
    if(get('dep'))get('dep').value=total==null?'':(total*n(get('pct')?.value||0)/100).toFixed(2);
    if(get('bal'))get('bal').value=total==null?'':(total-n(get('dep')?.value)).toFixed(2);
    const info=get('priceInfo');
    if(info){
      const ns=nights(),one=oneNightRegular();
      if(one==null||!ns)info.innerHTML='Unesite datume, broj gostiju i opciju smještaja da se izračuna redovna cijena.';
      else{const lines=[];for(let i=1;i<=ns;i++)lines.push('Noć '+i+': '+(one*(1-discountForNight(i))).toFixed(2)+' €');info.innerHTML='<div class="pricebig">Redovna cijena: '+Number(reg).toFixed(2)+' €</div><div class="notice">'+lines.join(' · ')+'</div>'+(ns>1?'<div class="savehint">Automatski popust za više noćenja primijenjen je samo na redovnu cijenu.</div>':'');}
    }
  }
  function renderSettings(){
    const tbody=get('prices');if(!tbody)return;
    const rows=Object.entries(P).map(([name,a])=>'<tr><td>'+name+'</td>'+a.map(v=>'<td>'+(v==null?'—':v+' €')+'</td>').join('')+'</tr>').join('');
    const head=tbody.parentElement?.querySelector('thead tr');if(head)head.innerHTML='<th>Smještaj</th><th>1 osoba</th><th>2 osobe</th><th>3 osobe</th><th>4 osobe</th>';
    tbody.innerHTML=rows;
  }
  function bind(){
    ['ad','ch','ci','co','acc','ptype','special','pct'].forEach(id=>get(id)?.addEventListener('input',update));
    ['ci','co','acc','ptype'].forEach(id=>get(id)?.addEventListener('change',update));
    renderSettings();update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.GMPriceEngine={update,regularTotal,oneNightRegular};
})();
