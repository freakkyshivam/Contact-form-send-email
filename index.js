import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import axios from "axios";
import { rateLimit } from 'express-rate-limit'
const app = express();

app.use(cors({
  origin: [
   'http://localhost:5173', 
   'http://localhost:3000', 
   'http://localhost:5000', 
   'http://localhost:5174',
   'https://my-portfolio-beige-three-27.vercel.app',
  'https://freakkyshivam.netlify.app'
  ], 
  credentials: true
}));



const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56, 
})

 
app.use(limiter)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Invalid email" });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #a855f7; border-bottom: 2px solid #a855f7; padding-bottom: 10px; margin-bottom: 20px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;">
              <strong style="color: #555;">Name:</strong> 
              <span style="color: #333;">${name}</span>
            </p>
            <p style="margin: 10px 0;">
              <strong style="color: #555;">Email:</strong> 
              <span style="color: #333;">${email}</span>
            </p>
            <p style="margin: 10px 0;">
              <strong style="color: #555;">Subject:</strong> 
              <span style="color: #333;">${subject}</span>
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #a855f7; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>This email was sent from your portfolio contact form.</p>
            <p>Reply directly to this email to respond to ${email}</p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from your portfolio contact form.
Reply to: ${email}
    `;

    
    const payload = {
      sender: { name: "My Portfolio", email: process.env.SENDER_EMAIL },
      to: [{ email: process.env.SENDER_EMAIL }],
      replyTo: { email },
      subject: `Portfolio Contact: ${subject}`,
      htmlContent,
      textContent
    };

    const response =  axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "content-type": "application/json",
          "api-key": process.env.SMTP_API_KEY
        },
        timeout: 5000
      }
    );

    res.json({ success: true, message: "Email sent successfully!" });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Email sending failed. Try again later." 
    });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running")
);
