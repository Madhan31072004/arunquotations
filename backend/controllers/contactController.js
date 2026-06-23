const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// @desc    Submit a new contact/consultation message & notify via Email + WhatsApp
// @route   POST /api/contact
// @access  Public
exports.submitMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least a name and a message',
      });
    }

    // 1. Save submission to MongoDB database
    const newMessage = await Message.create({
      name,
      email,
      phone,
      message,
    });

    // 2. Send premium HTML email notification to Arun
    try {
      const emailUser = process.env.EMAIL_USER || 'arunkumargopaldas@gmail.com';
      const emailPass = process.env.EMAIL_PASS;

      if (!emailPass || emailPass === 'your_gmail_app_password') {
        console.log('\n=============================================================');
        console.log('⚠️  EMAIL NOTIFICATION ACTIVE: Credentials are not configured yet!');
        console.log('To receive automatic email alerts when a client submits the form:');
        console.log('1. Go to your Google Account settings -> Security.');
        console.log('2. Enable 2-Step Verification.');
        console.log('3. Search for "App Passwords" and generate a 16-character key.');
        console.log('4. Copy & paste your credentials into backend/.env:');
        console.log('   EMAIL_USER=arunkumargopaldas@gmail.com');
        console.log('   EMAIL_PASS=xxxx xxxx xxxx xxxx');
        console.log('=============================================================\n');
      } else {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        const mailOptions = {
          from: `"Arun Interiors Portfolio" <${emailUser}>`,
          to: 'arunkumargopaldas@gmail.com', // Always notify Arun
          replyTo: email || undefined,
          subject: `✨ New Consultation Inquiry from ${name}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #c9a96e; border-radius: 12px; background-color: #0b0b0b; color: #ffffff;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #c9a96e; font-size: 26px; font-weight: 300; letter-spacing: 2px; margin: 0 0 5px 0;">ARUN</h1>
                <p style="color: #888888; font-size: 12px; letter-spacing: 4px; margin: 0; text-transform: uppercase;">Interiors Portfolio</p>
              </div>
              
              <h2 style="color: #c9a96e; text-align: center; border-bottom: 1px solid rgba(201,169,110,0.3); padding-bottom: 15px; margin-top: 0; font-weight: 400; font-size: 20px;">New Consultation Request</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #dddddd; text-align: center;">You have received a new consultation inquiry from your portfolio website.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 15px;">
                <tr style="border-bottom: 1px solid rgba(201,169,110,0.15);">
                  <td style="padding: 12px 0; font-weight: bold; color: #c9a96e; width: 120px;">Name:</td>
                  <td style="padding: 12px 0; color: #ffffff;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(201,169,110,0.15);">
                  <td style="padding: 12px 0; font-weight: bold; color: #c9a96e;">Email:</td>
                  <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #ffffff; text-decoration: underline;">${email || 'Not provided'}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(201,169,110,0.15);">
                  <td style="padding: 12px 0; font-weight: bold; color: #c9a96e;">Phone:</td>
                  <td style="padding: 12px 0;"><a href="tel:${phone}" style="color: #ffffff; text-decoration: underline;">${phone || 'Not provided'}</a></td>
                </tr>
              </table>
              
              <div style="background-color: rgba(255,255,255,0.03); border-left: 4px solid #c9a96e; padding: 20px; border-radius: 4px; margin-top: 25px;">
                <h4 style="margin: 0 0 12px 0; color: #c9a96e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Message / Inquiry:</h4>
                <p style="margin: 0; line-height: 1.6; color: #eeeeee; font-size: 15px; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="font-size: 12px; color: #666666; margin: 0;">
                  Sent automatically from the Arun Interiors Portfolio System
                </p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`\n📧 Success: Consultation notification email sent successfully to arunkumargopaldas@gmail.com!\n`);
      }
    } catch (mailError) {
      console.error('❌ Nodemailer Error: Failed to send mail notification:', mailError.message);
    }

    // 3. Send automatic WhatsApp alert via Twilio if configured
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioNumber = process.env.TWILIO_FROM_NUMBER || 'whatsapp:+14155238886'; // default Twilio sandbox number

      if (accountSid && authToken) {
        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);

        await client.messages.create({
          from: twilioNumber,
          to: 'whatsapp:+918498997856', // Hardcoded to send directly to your WhatsApp number
          body: `✨ *New Consultation Request!*\n\n*Name:* ${name}\n*Phone:* ${phone || 'N/A'}\n*Email:* ${email || 'N/A'}\n\n*Message:* ${message}`,
        });
        console.log(`\n💬 Success: WhatsApp notification sent successfully to 8498997856!\n`);
      } else {
        console.log('📢 Note: Twilio credentials not set. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env for WhatsApp alerts.');
      }
    } catch (twilioError) {
      console.error('❌ Twilio Error: Failed to send WhatsApp notification:', twilioError.message);
    }

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Arun will contact you Shortly .. Thank you for choosing Arun Interiors',
    });
  } catch (error) {
    next(error);
  }
};
