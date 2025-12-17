const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
    this.authURL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    this.stkPushURL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(this.authURL, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async initiateSTKPush(phone, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      
      // Format phone number (remove leading 0, add 254)
      const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;
      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
      
      const requestData = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(this.stkPushURL, requestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error initiating STK Push:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MpesaService();