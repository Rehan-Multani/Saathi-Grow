import nodemailer from 'nodemailer';

/**
 * Send Bill Invoice Email to Customer
 * @param {string} toEmail - Customer Email
 * @param {object} order - Order object with items and bill details
 */
export const sendInvoiceEmail = async (toEmail, order) => {
  try {
    if (!toEmail) return false;

    // Configure transporter (These should ideally be in process.env)
    // User will need to fill these in .env to make it work
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
            </tr>
        `).join('');

    const mailOptions = {
      from: `"SaathiGro POS" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Purchase Invoice: Order #${order.orderId}`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #6366f1; margin-bottom: 5px;">SaathiGro</h1>
                        <p style="color: #666; font-size: 14px;">Store Purchase Invoice</p>
                    </div>
                    
                    <div style="margin-bottom: 20px; font-size: 14px;">
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Payment Mode:</strong> ${order.paymentMethod.toUpperCase()}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                        <thead>
                            <tr style="background-color: #f9fafb;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #6366f1; color: #6366f1;">ITEM</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #6366f1; color: #6366f1;">QTY</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6366f1; color: #6366f1;">PRICE</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6366f1; color: #6366f1;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="text-align: right; font-size: 14px;">
                        <p>Subtotal: <strong>₹${order.subTotal.toFixed(2)}</strong></p>
                        <p>Tax Amount: <strong>₹${order.taxAmount.toFixed(2)}</strong></p>
                        <div style="font-size: 20px; color: #6366f1; margin-top: 10px;">
                            Total Payable: <strong>₹${order.totalAmount.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
                        Thank you for shopping with SaathiGro!<br>
                        This is a computer-generated invoice.
                    </div>
                </div>
            `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Invoice sent for Order #${order.orderId}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error('[EMAIL-ERROR] Failed to send invoice email:', error.message);
    return false;
  }
};

/**
 * Send Welcome Email to New User / Staff / Vendor / Partner
 * @param {string} toEmail 
 * @param {string} name 
 * @param {string} role 
 * @param {string} password 
 */
export const sendWelcomeEmail = async (toEmail, name, role, password = null) => {
  try {
    if (!toEmail) return false;
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: `"SaathiGro" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Welcome to SaathiGro: ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #6366f1;">Welcome, ${name}!</h2>
          <p>We are excited to have you onboard as a <strong>${role}</strong> at SaathiGro.</p>
          ${password && !password.includes('OTP') ? `<p>Your temporary password is: <strong>${password}</strong><br>Please change it after your first login.</p>` : ''}
          ${role === 'Rider' || role === 'Delivery Partner' ? `<p style="padding: 15px; background: #f0f7ff; border-radius: 12px; color: #0369a1; border: 1px solid #bae6fd; font-size: 13px;"><strong>Logistics Note:</strong> You can quickly login to the Delivery App using your registered phone number and a secure 4-digit OTP sent to your mobile.</p>` : ''}
          <p>You can now access your portal and start managing your operations.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.BASE_URL || '#'}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Portal</a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[EMAIL-ERROR] Welcome email failed:', error.message);
    return false;
  }
};

/**
 * Send Generic Notification Email
 */
export const sendSystemNotificationEmail = async (toEmail, subject, title, body) => {
  try {
    if (!toEmail) return false;
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: `"SaathiGro Notifications" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h3 style="color: #6366f1;">${title}</h3>
          <p style="color: #333; line-height: 1.6;">${body}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated notification from SaathiGro. Please do not reply to this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[EMAIL-ERROR] Notification email failed:', error.message);
    return false;
  }
};
