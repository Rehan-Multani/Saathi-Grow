import axios from 'axios';
import { SMSINDIAHUB_BASE_URL } from '../config/serviceUrls.js';

class SMSIndiaHubService {
  constructor() {
    this.apiKey = process.env.SMSINDIAHUB_API_KEY;
    this.senderId = process.env.SMSINDIA_HUB_SENDER_ID || 'SMSHUB';
    this.baseUrl = SMSINDIAHUB_BASE_URL;
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
    const message = `Welcome to the SaathiGro powered by SMSINDIAHUB.Your OTP for registration is ${otp}`;
    
    // Fire and forget - don't await this in the main controller to prevent timeouts from blocking users
    this.sendSMS(phone, message).catch(err => {
      console.error('🔥 [SMS-Background-Queue] Final failure:', err.message);
    });
    
    return { success: true, queued: true };
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
      console.log(`📨 [SMSIndiaHub] Dispatching to ${normalizedPhone}...`);

      const response = await axios.get(apiUrl, {
        headers: { 'User-Agent': 'SaathiGro/1.0' },
        timeout: 8000 // Slightly shorter timeout to fail faster
      });

      // SMSIndiaHub sometimes returns response as string or JSON
      const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      console.log(`📡 [SMSIndiaHub] Raw Response: ${responseData}`);

      if (responseData.includes('ErrorCode="000"') || responseData.includes('ErrorCode:000') || responseData.includes('"ErrorCode":"000"')) {
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
