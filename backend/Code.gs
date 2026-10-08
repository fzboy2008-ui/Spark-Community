/*
SPARK COMMUNITY — Google Apps Script backend
1) Create a Google Sheet.
2) Extensions -> Apps Script.
3) Paste this file into Code.gs.
4) Deploy -> New deployment -> Web app.
   Execute as: Me
   Who has access: Anyone
5) Copy the Web App URL into BACKEND_URL in assets/app.js.

The script creates a "Orders" sheet automatically.
Admin approval/cancel links are emailed to fzboy2008@gmail.com.
*/
const ADMIN_EMAIL = "fzboy2008@gmail.com";
const SHEET_NAME = "Orders";

function sheet_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh) sh=ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow()===0) sh.appendRow(["Order ID","Date","Name","Email","Discord","Server","Service","Amount","Period","UTR","Requirements","Status","Token"]);
  return sh;
}
function doPost(e){
  const data=JSON.parse(e.postData.contents);
  const token=Utilities.getUuid();
  sheet_().appendRow([data.id,data.date,data.name,data.email,data.discord,data.server||"",data.service,data.total,data.period,data.utr||"",data.requirements||"","PROCESSING",token]);
  const base=ScriptApp.getService().getUrl();
  const approve=base+"?action=approve&id="+encodeURIComponent(data.id)+"&token="+encodeURIComponent(token);
  const cancel=base+"?action=cancel&id="+encodeURIComponent(data.id)+"&token="+encodeURIComponent(token);
  const html=`<div style="font-family:Arial;padding:24px"><h2>⚡ New Spark Community Order</h2><p><b>Order:</b> ${data.id}</p><p><b>Customer:</b> ${data.name}<br><b>Email:</b> ${data.email}<br><b>Discord:</b> ${data.discord}</p><p><b>Service:</b> ${data.service}<br><b>Amount:</b> ${data.total}<br><b>UTR:</b> ${data.utr}</p><p><b>Requirements:</b><br>${String(data.requirements||"").replace(/\n/g,"<br>")}</p><hr><a href="${approve}" style="background:#7c3aed;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;margin-right:10px">APPROVE ORDER</a><a href="${cancel}" style="background:#dc2626;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">CANCEL ORDER</a><p style="color:#777;margin-top:25px">Order remains PROCESSING until one of the buttons is used.</p></div>`;
  MailApp.sendEmail({to:ADMIN_EMAIL,subject:"New Spark Community Order — "+data.id,htmlBody:html});
  return ContentService.createTextOutput(JSON.stringify({ok:true,id:data.id})).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e){
  const p=e.parameter||{}, id=p.id, action=p.action, token=p.token;
  const sh=sheet_(), rows=sh.getDataRange().getValues();
  if(action && id && token){
    for(let r=1;r<rows.length;r++){
      if(rows[r][0]===id && rows[r][12]===token){
        const newStatus=action==="approve"?"APPROVED":"CANCELLED";
        sh.getRange(r+1,12).setValue(newStatus);
        const customer=rows[r][3], amount=rows[r][7];
        MailApp.sendEmail(customer,"Spark Community Order "+newStatus+" — "+id,
          "Your Spark Community order "+id+" is now "+newStatus+".\nAmount: "+amount+"\n\nThank you.");
        return HtmlService.createHtmlOutput(`<div style="font-family:Arial;padding:50px;text-align:center"><h1>⚡ Order ${newStatus}</h1><p>${id}</p><p>The customer has been notified.</p></div>`);
      }
    }
    return HtmlService.createHtmlOutput("Invalid or expired approval link.");
  }
  if(id){
    for(let r=1;r<rows.length;r++) if(rows[r][0]===id){
      const result={id:rows[r][0],date:rows[r][1],name:rows[r][2],service:rows[r][6],amount:rows[r][7],status:rows[r][11]};
      const callback=p.callback||"";
      const out=JSON.stringify(result);
      return callback ? ContentService.createTextOutput(callback+"("+out+")").setMimeType(ContentService.MimeType.JAVASCRIPT)
                      : ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ok:true,service:"Spark Community Billing"})).setMimeType(ContentService.MimeType.JSON);
}