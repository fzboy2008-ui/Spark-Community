const BACKEND_URL = ""; // Paste your deployed Google Apps Script Web App URL here.

const service=document.getElementById('service'), featureBox=document.getElementById('featureBox'), panelBox=document.getElementById('panelBox');
const featureCount=document.getElementById('featureCount'), panel=document.getElementById('panel'), total=document.getElementById('total');
const paymentSection=document.getElementById('paymentSection'), qrImage=document.getElementById('qrImage'), qrName=document.getElementById('qrName'), upiId=document.getElementById('upiId'), qrAmount=document.getElementById('qrAmount');

const methods={gpay:{name:'Google Pay',image:'assets/payment/gpay.png',upi:'fzboy2008@okhdfcbank'},phonepe:{name:'PhonePe',image:'assets/payment/phonepe.png',upi:'PhonePe QR'},paytm:{name:'Paytm',image:'assets/payment/paytm.png',upi:'6006283334@ptyes'}};

function priceData(){
  const s=service?.value;
  if(s==='spark-all') return {amount:250,display:'₹250 / month',label:'Spark Bot — All Features'};
  if(s==='spark-feature'){const n=Math.max(1,Number(featureCount.value)||1);return {amount:n*20+50,display:`₹${n*20+50} first month`,label:`Spark Bot — ${n} feature(s) + Discord setup`};}
  if(s==='custom-bot'){const p=panel.value==='spark';return {amount:500+(p?300:0),display:p?'₹800 first month':'₹500 one-time',label:'Custom Bot Creation'};}
  return {amount:50,display:'₹50 one-time',label:'Discord Setup'};
}
function updatePrice(){if(!service)return;const s=service.value;featureBox?.classList.toggle('hidden',s!=='spark-feature');panelBox?.classList.toggle('hidden',s!=='custom-bot');const d=priceData();total.textContent=d.display;if(qrAmount)qrAmount.textContent='₹'+d.amount;}
[service,featureCount,panel].filter(Boolean).forEach(x=>x.addEventListener('input',updatePrice)); updatePrice();

document.querySelectorAll('.pay-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.pay-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');const m=methods[tab.dataset.pay];qrImage.src=m.image;qrName.textContent=m.name;upiId.textContent=m.upi;}));

const form=document.getElementById('orderForm');
if(form){
  const params=new URLSearchParams(location.search); const initial=params.get('service'); if(initial&&service){service.value=initial;updatePrice();}
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(form);
    if(!fd.get('utr')){
      paymentSection.classList.remove('hidden'); updatePrice();
      paymentSection.scrollIntoView({behavior:'smooth',block:'start'});
      document.getElementById('utr')?.focus(); return;
    }
    const d=priceData();
    const id='SPK-'+new Date().getFullYear()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
    const order={id,date:new Date().toLocaleString('en-IN'),status:'PROCESSING',name:fd.get('name'),email:fd.get('email'),discord:fd.get('discord'),server:fd.get('server'),service:d.label,requirements:fd.get('requirements'),total:'₹'+d.amount,period:d.display,utr:fd.get('utr')};
    localStorage.setItem('sparkOrder_'+id,JSON.stringify(order));
    if(BACKEND_URL){
      try{await fetch(BACKEND_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(order)});}catch(err){console.warn(err);}
    }else{
      const subject=encodeURIComponent(`New Spark Community Order — ${id}`);
      const body=encodeURIComponent(`Order ID: ${id}\nName: ${order.name}\nEmail: ${order.email}\nDiscord: ${order.discord}\nService: ${order.service}\nAmount: ${order.total}\nUTR: ${order.utr}\nRequirements: ${order.requirements}`);
      window.location.href=`mailto:fzboy2008@gmail.com?subject=${subject}&body=${body}`;
    }
    location.href='success.html?id='+encodeURIComponent(id);
  });
}