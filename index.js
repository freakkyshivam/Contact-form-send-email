 
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import 'dotenv/config';

const app = express();

 
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174','https://my-portfolio-beige-three-27.vercel.app'], 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

 
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP verification failed:", err.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});
 
app.get("/", (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

 
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
 
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }
 
    if (!process.env.SENDER_EMAIL || !process.env.SMTP_PASS || !process.env.SMTP_USER) {
      console.error("❌ Missing environment variables");
      return res.status(500).json({
        success: false,
        error: "Server configuration error"
      });
    }

   
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.SENDER_EMAIL,  
      replyTo: email, 
      subject: `Portfolio Contact: ${subject}`,
      html: `
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
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from your portfolio contact form.
Reply to: ${email}
      `
    };
 
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log("   From:", name, `(${email})`);
    console.log("   Subject:", subject);
    console.log("   Message ID:", info.messageId);
 
    res.status(200).json({
      success: true,
      message: "Email sent successfully!"
    });

  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  
    res.status(500).json({
      success: false,
      error: "Failed to send email. Please try again later."
    });
  }
});
 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

 
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email service configured with Brevo SMTP`);
  console.log(`✅ Ready to receive contact form submissions`);
});
