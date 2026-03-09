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
