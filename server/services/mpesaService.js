const axios = require('axios');

class MpesaService {
  constructor() {
    // Use provided credentials or fallback to environment variables
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '4CNyZAAlMSslZzGGA9QME5XlXpcviHbSC7uTD5Z3mgIrqUOl';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'ecaJR4OMDZlrAoqG6WmQgZG5gvr4gS20w6qrfGZyAYadjp5IevUcO5OGOAuw8pdE';
    
    // Production M-Pesa configuration
    this.businessShortCode = process.env.MPESA_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    
    // Use production URL by default
    this.baseURL = 'https://api.safaricom.co.ke';
      
    this.accessToken = null;
    this.tokenExpiry = null;
    
    console.log('🔧 M-Pesa Service initialized:', {
      environment: process.env.NODE_ENV || 'development',
      baseURL: this.baseURL,
      shortcode: this.businessShortCode,
      consumerKeyLength: this.consumerKey ? this.consumerKey.length : 0,
      consumerSecretLength: this.consumerSecret ? this.consumerSecret.length : 0,
      passkeyLength: this.passkey ? this.passkey.length : 0
    });
  }

  // Generate access token
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, set expiry to 55 minutes to be safe
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
      
      console.log('✅ M-Pesa access token generated successfully');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Error generating M-Pesa access token:', error.response?.data || error.message);
      throw new Error('Failed to generate M-Pesa access token');
    }
  }

  // Generate password for STK Push
  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  // Format phone number to required format
  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    } else if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    
    return formatted;
  }

  // Initiate STK Push
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      // Validate inputs
      if (!phoneNumber || !amount || !accountReference || !transactionDesc) {
        throw new Error('Missing required parameters for STK Push');
      }

      if (amount < 1 || amount > 70000) {
        throw new Error('Amount must be between 1 and 70,000 KSH');
      }

      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Validate phone number format
      if (!/^254[0-9]{9}$/.test(formattedPhone)) {
        throw new Error('Invalid phone number format. Must be a valid Kenyan number.');
      }

      const stkPushData = {
        BusinessShortCode: parseInt(this.businessShortCode),
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: parseInt(amount),
        PartyA: formattedPhone,
        PartyB: parseInt(this.businessShortCode),
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://webhook.site/unique-id-here',
        AccountReference: accountReference.replace(/[^a-zA-Z0-9-]/g, ''), // Remove special characters
        TransactionDesc: transactionDesc.replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      };

      console.log('📱 Initiating STK Push:', {
        phone: formattedPhone,
        amount,
        reference: accountReference
      });

      console.log('📱 STK Push request data:', JSON.stringify(stkPushData, null, 2));

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        stkPushData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ STK Push initiated successfully:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ STK Push error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle specific M-Pesa errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for common M-Pesa errors
        if (errorData.errorMessage) {
          throw new Error(`M-Pesa Error: ${errorData.errorMessage}`);
        } else if (errorData.Envelope?.Body?.Fault) {
          const fault = errorData.Envelope.Body.Fault;
          throw new Error(`M-Pesa SOAP Fault: ${fault.faultstring || 'Unknown SOAP error'}`);
        } else if (typeof errorData === 'string' && errorData.includes('Fault')) {
          throw new Error('M-Pesa service temporarily unavailable. Please try again.');
        }
      }
      
      throw new Error('Failed to initiate M-Pesa payment. Please check your phone number and try again.');
    }
  }

  // Query STK Push status
  async querySTKPushStatus(checkoutRequestID) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const queryData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        queryData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('❌ STK Push query error:', error.response?.data || error.message);
      throw new Error('Failed to query M-Pesa payment status');
    }
  }

  // Validate M-Pesa callback
  validateCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      if (!stkCallback) {
        throw new Error('Invalid callback format');
      }

      const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;
      
      let transactionData = {
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        success: ResultCode === 0
      };

      // Extract transaction details if payment was successful
      if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
        const metadata = {};
        CallbackMetadata.Item.forEach(item => {
          metadata[item.Name] = item.Value;
        });

        transactionData = {
          ...transactionData,
          Amount: metadata.Amount,
          MpesaReceiptNumber: metadata.MpesaReceiptNumber,
          TransactionDate: metadata.TransactionDate,
          PhoneNumber: metadata.PhoneNumber
        };
      }

      return transactionData;

    } catch (error) {
      console.error('❌ Callback validation error:', error.message);
      throw new Error('Invalid M-Pesa callback data');
    }
  }
}

module.exports = new MpesaService();
