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

    const baseDomain = 'https://saathigro.in';
    let portalUrl = `${baseDomain}/admin/login`;
    let portalName = 'Admin Portal';

    const normalizedRole = (role || '').trim().toLowerCase().replace(/[-_]/g, ' ');
    let displayRole = role;

    if (normalizedRole === 'branch manager') {
      displayRole = 'Store Manager';
    }

    if (normalizedRole === 'vendor') {
      portalUrl = `${baseDomain}/vendor/login`;
      portalName = 'Vendor Portal';
    } else if (normalizedRole === 'staff') {
      portalUrl = `${baseDomain}/staff/login`;
      portalName = 'Staff Portal';
    } else if (normalizedRole === 'rider' || normalizedRole === 'delivery partner' || normalizedRole === 'delivery boy') {
      portalUrl = `${baseDomain}/delivery/login`;
      portalName = 'Delivery Partner Portal';
    } else if (normalizedRole === 'store manager' || normalizedRole === 'branch manager' || normalizedRole === 'store manger' || normalizedRole === 'store maanger') {
      portalUrl = `${baseDomain}/store-manager/login`;
      portalName = 'Store Manager Portal';
    } else if (normalizedRole === 'customer') {
      portalUrl = `${baseDomain}/`;
      portalName = 'SaathiGro Online Store';
    }

    const isCustomer = normalizedRole === 'customer';
    const mailOptions = {
      from: isCustomer ? `"SaathiGro" <${process.env.EMAIL_USER}>` : `"SaathiGro Teams" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: isCustomer ? `Welcome to SaathiGro, ${name}!` : `Welcome to SaathiGro: ${displayRole} Access Provisioned`,
      html: `
        <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 30px auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px; background-color: #ffffff; color: #0f172a; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          <!-- Header Logo -->
          <div style="text-align: center; margin-bottom: 35px;">
            <div style="font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: -1px; margin-bottom: 6px;">SaathiGro</div>
            <div style="display: inline-block; background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 9999px;">
              Partner Network
            </div>
          </div>

          <!-- Welcome Header -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">Hello ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0;">
              ${isCustomer 
                ? 'Welcome to SaathiGro! We are thrilled to have you join our community. Your shopping account has been successfully created.' 
                : `Welcome to SaathiGro! We are thrilled to have you onboard. Your professional account has been successfully created and configured with the role of <strong>${displayRole}</strong>.`
              }
            </p>
          </div>

          <!-- Credentials Container -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: left;">
            <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
              ${isCustomer ? 'Your Account Information' : 'Your Portal Credentials'}
            </h3>
            
            <div style="margin-bottom: 12px; font-size: 15px;">
              <span style="color: #64748b; display: inline-block; width: 100px;">Access Link:</span> 
              <a href="${portalUrl}" style="color: #4f46e5; font-weight: 600; text-decoration: none;">${portalName}</a>
            </div>
            
            <div style="margin-bottom: 12px; font-size: 15px;">
              <span style="color: #64748b; display: inline-block; width: 100px;">Username:</span> 
              <strong style="color: #1e293b; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${toEmail}</strong>
            </div>

            ${!isCustomer && password ? `
            <div style="margin-bottom: 12px; font-size: 15px;">
              <span style="color: #64748b; display: inline-block; width: 100px;">Password:</span> 
              <strong style="color: #1e293b; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</strong>
            </div>
            ` : ''}

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: ${isCustomer ? '#4f46e5' : '#ef4444'}; font-weight: 600;">
              ${isCustomer 
                ? '💡 Quick Tip: You can also log in seamlessly using your registered phone number via a secure OTP.' 
                : '⚠️ Security Reminder: For your protection, please update your temporary password immediately upon your first successful login.'
              }
            </div>
          </div>

          <!-- Description / Getting Started -->
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 30px 0;">
            ${isCustomer
              ? 'Click the button below to explore our products, view local offers, and place your first order!'
              : 'Click the button below to sign in and access your partner dashboard. You\'ll be able to manage orders, update business profile, and execute your operations seamlessly.'
            }
          </p>

          <!-- Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${portalUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); transition: all 0.2s ease;">
              ${isCustomer ? 'Start Shopping' : 'Go to login'}
            </a>
          </div>

          <!-- Bottom Help Note -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; color: #1e40af; font-size: 13px; line-height: 1.5; margin: 30px 0;">
            <strong>Need help?</strong> If you have any trouble logging in or configuring your workspace, please reach out to our administration team or email us at support@saathigro.in.
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} SaathiGro Systems. All rights reserved.</p>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0;">This is an automated system communication sent to ${toEmail}.</p>
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

/**
 * Send Reset Password Email
 * @param {string} toEmail 
 * @param {string} name 
 * @param {string} resetUrl 
 */
export const sendResetPasswordEmail = async (toEmail, name, resetUrl) => {
  try {
    if (!toEmail) return false;
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: `"SaathiGro Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 16px; background-color: #ffffff; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px; letter-spacing: -0.5px;">SaathiGro</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Security Protocol</p>
          </div>

          <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 20px; font-weight: 700;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hello ${name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">A request has been received to reset the password for your account. If you did not make this request, you can safely ignore this email.</p>
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">Reset My Password</a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-top: 30px;">
            For security reasons, this link will expire in 1 hour.
          </p>
          
          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} SaathiGro Systems. All rights reserved.</p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 5px;">This is a system-generated security communication.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[EMAIL-ERROR] Reset password email failed:', error.message);
    return false;
  }
};
