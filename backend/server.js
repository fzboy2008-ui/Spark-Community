/*
  SPARK COMMUNITY BACKEND
  Deploy this folder to Railway/Render/etc.
  GitHub Pages CANNOT safely handle Razorpay secrets, email credentials,
  approval links or server-side invoice generation.

  Required environment variables:
    PORT=3000
    FRONTEND_URL=https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO
    ADMIN_EMAIL=fzboy2008@gmail.com
    RAZORPAY_KEY_ID=...
    RAZORPAY_KEY_SECRET=...
    SMTP_HOST=...
    SMTP_PORT=587
    SMTP_USER=...
    SMTP_PASS=...
    MONGODB_URI=...

  Suggested packages:
    express cors dotenv nodemailer razorpay mongodb

  Endpoints to implement:
    POST /api/orders              -> create order + payment order
    POST /api/payment/verify      -> verify gateway signature
    GET  /api/orders/:id           -> public status
    POST /api/orders/:id/approve  -> admin-only approval
    POST /api/orders/:id/cancel   -> admin-only cancellation
    GET  /api/invoices/:id        -> invoice data/PDF
    POST /api/contact              -> contact mail

  IMPORTANT:
  Do NOT put RAZORPAY_KEY_SECRET or SMTP_PASS in GitHub Pages JavaScript.
*/

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ok:true, service:"Spark Community Billing API"}));

app.post("/api/orders", (req,res)=>{
  // TODO: validate request, calculate price server-side,
  // create database order with status PROCESSING,
  // create Razorpay order, return payment order details.
  res.status(501).json({error:"Backend setup required. See backend/server.js comments."});
});

app.post("/api/payment/verify", (req,res)=>{
  // TODO: verify Razorpay signature server-side.
  res.status(501).json({error:"Payment verification endpoint not configured."});
});

app.get("/api/orders/:id", (req,res)=>{
  res.status(501).json({error:"Database endpoint not configured."});
});

app.listen(process.env.PORT || 3000, ()=>console.log("Spark Community API running"));
