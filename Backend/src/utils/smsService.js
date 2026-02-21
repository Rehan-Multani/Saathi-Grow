import axios from 'axios';

class SMSIndiaHubService {
  constructor() {
    this.apiKey = process.env.SMSINDIAHUB_API_KEY;
    this.senderId = process.env.SMSINDIA_HUB_SENDER_ID || 'SMSHUB';
    this.baseUrl = 'https://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
  }

  normalizePhoneNumber(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.substring(1);
    return '91' + digits.slice(-10);
  }

  async sendOTP(phone, otp) {
    // Template: Welcome to Saathi-Grow! Your OTP for verification is {#var#}. - Saathi-Grow Team
    const message = `Welcome to Saathi-Grow! Your OTP for verification is ${otp}. - SaathiGro`;
    return this.sendSMS(phone, message);
  }

  async sendSMS(phone, message) {
    try {
      const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this.senderId || process.env.SMSINDIAHUB_SENDER_ID;

      if (!apiKey) {
        console.warn('⚠️ [SMSIndiaHub] Missing API Key. SMS NOT SENT.');
        return { success: false, error: 'Missing API Key' };
      }

      const normalizedPhone = this.normalizePhoneNumber(phone);

      const params = new URLSearchParams({
        APIKey: apiKey,
        msisdn: normalizedPhone,
        sid: senderId,
        msg: message,
        fl: '0',
        dc: '0',
        gwid: '2'
      });

      const apiUrl = `${this.baseUrl}?${params.toString()}`;
      console.log(`📨 Sending SMS to ${normalizedPhone}...`);

      const response = await axios.get(apiUrl, {
        headers: { 'User-Agent': 'SaathiGro/1.0' },
        timeout: 10000
      });

      // SMSIndiaHub sometimes returns response as string or JSON
      const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      if (responseData.includes('ErrorCode="000"') || responseData.includes('ErrorCode:000')) {
        console.log('✅ SMS Sent Successfully');
        return { success: true, response: responseData };
      } else {
        console.error('❌ SMS Failed:', responseData);
        return { success: false, error: responseData };
      }

    } catch (error) {
      console.error('❌ SMS Service Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new SMSIndiaHubService();
