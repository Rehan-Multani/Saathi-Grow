import axios from 'axios';
import { SMSINDIAHUB_BASE_URL } from '../config/serviceUrls.js';

class SMSIndiaHubService {
  constructor() {
    this.apiKey = process.env.SMSINDIAHUB_API_KEY;
    this.senderId = process.env.SMSINDIA_HUB_SENDER_ID || process.env.SMSINDIAHUB_SENDER_ID;
    this.entityId = process.env.SMSINDIAHUB_ENTITY_ID;
    this.templateId = process.env.SMSINDIAHUB_TEMPLATE_ID;
    this.brandName = process.env.SMSINDIAHUB_BRAND_NAME || 'SaathiGro';
    this.baseUrl = SMSINDIAHUB_BASE_URL;
  }

  normalizePhoneNumber(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.substring(1);
    return '91' + digits.slice(-10);
  }

  buildOtpMessage(otp) {
    // Exact DLT template (Manage Template):
    // Welcome to the ##var## powered by Appzeto.Your OTP for registration is ##var##.BGADEC
    return `Welcome to the ${this.brandName} powered by Appzeto.Your OTP for registration is ${otp}.BGADEC`;
  }

  async sendOTP(phone, otp) {
    const message = this.buildOtpMessage(otp);

    // Fire and forget - don't block OTP API response on SMS gateway latency
    this.sendSMS(phone, message).catch((err) => {
      console.error('🔥 [SMS-Background-Queue] Final failure:', err.message);
    });

    return { success: true, queued: true };
  }

  async sendSMS(phone, message) {
    try {
      const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this.senderId || process.env.SMSINDIA_HUB_SENDER_ID || process.env.SMSINDIAHUB_SENDER_ID;
      const entityId = this.entityId || process.env.SMSINDIAHUB_ENTITY_ID;
      const templateId = this.templateId || process.env.SMSINDIAHUB_TEMPLATE_ID;

      if (!apiKey) {
        console.warn('⚠️ [SMSIndiaHub] Missing API Key. SMS NOT SENT.');
        return { success: false, error: 'Missing API Key' };
      }

      if (!senderId) {
        console.warn('⚠️ [SMSIndiaHub] Missing Sender ID. SMS NOT SENT.');
        return { success: false, error: 'Missing Sender ID' };
      }

      const normalizedPhone = this.normalizePhoneNumber(phone);

      const params = new URLSearchParams({
        APIKey: apiKey,
        msisdn: normalizedPhone,
        sid: senderId,
        msg: message,
        fl: '0',
        dc: '0',
        gwid: '2', // Transactional / OTP route
      });

      // DLT params (from Manage SenderId / Manage Template screens)
      if (entityId) params.set('EntityID', entityId);
      if (templateId) params.set('TemplateID', templateId);

      const apiUrl = `${this.baseUrl}?${params.toString()}`;
      console.log(`📨 [SMSIndiaHub] Dispatching to ${normalizedPhone} | sender="${senderId}" | template="${templateId || 'n/a'}"`);
      console.log(`📝 [SMSIndiaHub] Message: ${message}`);

      const response = await axios.get(apiUrl, {
        headers: { 'User-Agent': 'SaathiGro/1.0' },
        timeout: 15000,
      });

      const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      console.log(`📡 [SMSIndiaHub] Raw Response: ${responseData}`);

      if (
        responseData.includes('ErrorCode="000"') ||
        responseData.includes('ErrorCode:000') ||
        responseData.includes('"ErrorCode":"000"')
      ) {
        console.log('✅ SMS Sent Successfully');
        return { success: true, response: responseData };
      }

      console.error('❌ SMS Failed:', responseData);
      return { success: false, error: responseData };
    } catch (error) {
      console.error('❌ SMS Service Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new SMSIndiaHubService();
