const service = document.getElementById('service');
const featureBox = document.getElementById('featureBox');
const panelBox = document.getElementById('panelBox');
const featureCount = document.getElementById('featureCount');
const panel = document.getElementById('panel');
const total = document.getElementById('total');

function updatePrice(){
  if(!service) return;
  const s=service.value;
  featureBox.classList.toggle('hidden', s!=='spark-feature');
  panelBox.classList.toggle('hidden', s!=='custom-bot');
  if(s==='spark-all') total.textContent='₹250 / month';
  if(s==='spark-feature'){
    const n=Math.max(1, Number(featureCount.value)||1);
    total.textContent='₹'+(n*20+50)+' / first month';
  }
  if(s==='custom-bot'){
    total.textContent=panel.value==='spark'?'₹800 first month':'₹500 one-time';
  }
  if(s==='discord-setup') total.textContent='₹50 one-time';
}
[service,featureCount,panel].forEach(x=>x && x.addEventListener('input',updatePrice));
updatePrice();

const form=document.getElementById('orderForm');
if(form){
 form.addEventListener('submit', async e=>{
   e.preventDefault();
   const fd=new FormData(form);
   const s=fd.get('service');
   let price=250, period='monthly', label='Spark Bot — All Features';
   if(s==='spark-feature'){
     const n=Math.max(1,Number(fd.get('featureCount'))||1);
     price=n*20+50; period='first month'; label=`Spark Bot — ${n} feature(s) + Discord setup`;
   } else if(s==='custom-bot'){
     price=500+(fd.get('panel')==='spark'?300:0); period=fd.get('panel')==='spark'?'first month':'one-time'; label='Custom Bot Creation';
   } else if(s==='discord-setup'){ price=50; period='one-time'; label='Discord Setup'; }
   const id='SPK-'+new Date().getFullYear()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
   const order={id,date:new Date().toLocaleString('en-IN'),status:'PROCESSING',name:fd.get('name'),email:fd.get('email'),discord:fd.get('discord'),server:fd.get('server'),service:label,requirements:fd.get('requirements'),total:'₹'+price,period,panel:fd.get('panel')||null};
   localStorage.setItem('sparkOrder_'+id,JSON.stringify(order));
   const subject=encodeURIComponent(`New Spark Community Order — ${id}`);
   const body=encodeURIComponent(`Order ID: ${id}\nName: ${order.name}\nEmail: ${order.email}\nDiscord: ${order.discord}\nServer: ${order.server}\nService: ${order.service}\nAmount: ${order.total} (${order.period})\n\nRequirements:\n${order.requirements}\n\nLIVE BACKEND TODO: Create payment order, verify payment, store order and email admin approval buttons.`);
   // Static GitHub Pages fallback: opens the billing email. Replace this with the backend endpoint in production.
   window.location.href=`mailto:fzboy2008@gmail.com?subject=${subject}&body=${body}`;
 });
}