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

    const isStaff = role === 'Staff' || role === 'Branch Manager' || role === 'Admin' || role === 'Vendor';
    const mailOptions = {
      from: `"SaathiGro Teams" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: isStaff ? `System Access Granted: ${role} Portal` : `Welcome to SaathiGro: ${role}`,
      html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 16px; background-color: #ffffff; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px; letter-spacing: -0.5px;">SaathiGro</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Partner Network</p>
          </div>

          <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 20px; font-weight: 700;">Welcome, ${name}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">We are pleased to inform you that your professional access has been provisioned. You have been onboarded as a <strong style="color: #6366f1;">${role}</strong> within our system.</p>
          
          ${isStaff && password ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="margin-top: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Login Credentials</h3>
            <div style="margin-bottom: 10px; font-size: 15px;">
              <span style="color: #94a3b8;">Portal ID:</span> <strong style="color: #1e293b; font-family: monospace;">${toEmail}</strong>
            </div>
            <div style="font-size: 15px;">
              <span style="color: #94a3b8;">Initial Key:</span> <strong style="color: #1e293b; font-family: monospace;">${password}</strong>
            </div>
            <p style="margin-top: 15px; margin-bottom: 0; font-size: 12px; color: #ef4444; font-weight: 600;">⚠️ Security Notice: Please change your password immediately after your first successful login.</p>
          </div>
          ` : ''}

          ${!isStaff && password && !password.includes('OTP') ? `<p style="font-size: 15px;">Your temporary password is: <strong style="color: #6366f1;">${password}</strong></p>` : ''}
          
          ${role === 'Rider' || role === 'Delivery Partner' ? `
          <div style="padding: 15px; background: #eff6ff; border-radius: 12px; color: #1e40af; border: 1px solid #bfdbfe; font-size: 13px; margin: 20px 0;">
            <strong>Logistics Note:</strong> You can quickly login to the Delivery App using your registered phone number and a secure 4-digit OTP sent to your mobile.
          </div>
          ` : ''}

          <p style="font-size: 16px; line-height: 1.6; color: #475569;">You can now access your dedicated dashboard to manage operations and view assigned tasks.</p>
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="${process.env.ADMIN_URL || process.env.BASE_URL || '#'}" style="background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">Access Management Portal</a>
          </div>

          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} SaathiGro Systems. All rights reserved.</p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 5px;">This is a system-generated communication sent to ${toEmail}.</p>
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
