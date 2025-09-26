# M-Pesa SOAP Fault Error Fixes

## 🚨 **Error Analysis:**

**Error**: `M-Pesa SOAP Fault: Evaluation of XSL ClearEmptyNodes.xsl failed with reason: "Unknown entity at line 4"`

**Root Cause**: This error typically occurs due to:
1. Invalid request format or special characters in request data
2. Incorrect data types (strings instead of integers)
3. Invalid callback URL format
4. Credential issues with M-Pesa sandbox

## 🔧 **Fixes Applied:**

### **1. Request Data Sanitization**
- **BusinessShortCode**: Convert to integer
- **Amount**: Convert to integer  
- **PartyB**: Convert to integer
- **AccountReference**: Remove special characters
- **TransactionDesc**: Remove special characters

### **2. Enhanced Error Handling**
- Detailed error logging with status codes
- Specific SOAP fault error parsing
- Better error messages for debugging

### **3. Input Validation**
- Phone number format validation (254XXXXXXXXX)
- Amount range validation (1-70,000 KSH)
- Required parameter validation

### **4. Debugging Enhancements**
- Log exact request data being sent
- Credential length verification
- Access token generation testing

## 🧪 **Testing Steps:**

### **Step 1: Test M-Pesa Service**
```bash
# Test the M-Pesa service initialization
curl http://localhost:5001/api/subscription/test
```

**Expected Response**:
```json
{
  "message": "M-Pesa service test successful",
  "originalPhone": "254708374149",
  "formattedPhone": "254708374149",
  "serviceConfig": {
    "baseURL": "https://sandbox.safaricom.co.ke",
    "shortcode": "174379"
  },
  "accessTokenGenerated": true,
  "accessTokenLength": 40
}
```

### **Step 2: Check Server Logs**
When starting the server, you should see:
```
🔧 M-Pesa Service initialized: {
  environment: 'development',
  baseURL: 'https://sandbox.safaricom.co.ke',
  shortcode: '174379',
  consumerKeyLength: 50,
  consumerSecretLength: 64,
  passkeyLength: 64
}
```

### **Step 3: Test STK Push**
Try initiating a subscription with phone number: `254708374149`

**Expected Server Logs**:
```
📱 STK Push request data: {
  "BusinessShortCode": 174379,
  "Password": "...",
  "Timestamp": "20231026094500",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": 100,
  "PartyA": "254708374149",
  "PartyB": 174379,
  "PhoneNumber": "254708374149",
  "CallBackURL": "https://webhook.site/unique-id-here",
  "AccountReference": "EDU-68d637a8893cc717ff12f586",
  "TransactionDesc": "EduVault Premium - Course Name Year 1"
}
```

## 🔍 **Troubleshooting:**

### **If Access Token Fails**:
```
❌ Error generating M-Pesa access token
```
**Solution**: Check M-Pesa credentials in environment variables

### **If STK Push Still Fails**:
```
❌ STK Push error details: { status: 500, ... }
```
**Possible Causes**:
1. **Invalid Credentials**: Sandbox credentials might be expired
2. **Network Issues**: Safaricom sandbox might be down
3. **Request Format**: Still some formatting issue

### **Alternative Testing**:
If sandbox continues to fail, you can:
1. **Check Safaricom Developer Portal**: Verify sandbox status
2. **Use Different Test Numbers**: Try `254708374150` or `254708374151`
3. **Check Callback URL**: Ensure it's accessible (use webhook.site for testing)

## 📋 **Environment Variables Required:**

```env
MPESA_CONSUMER_KEY=4CNyZAAlMSslZzGGA9QME5XlXpcviHbSC7uTD5Z3mgIrqUOl
MPESA_CONSUMER_SECRET=ecaJR4OMDZlrAoqG6WmQgZG5gvr4gS20w6qrfGZyAYadjp5IevUcO5OGOAuw8pdE
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://webhook.site/unique-id-here
```

## 🚀 **Next Steps:**

1. **Test the service endpoint**: `GET /api/subscription/test`
2. **Check server logs** for initialization details
3. **Try STK Push** with test phone number
4. **Monitor logs** for detailed error information
5. **If still failing**: The issue might be with Safaricom's sandbox service

## ⚠️ **Important Notes:**

- **No Mock Payments**: All payments now go through real M-Pesa API
- **Sandbox Only**: Currently configured for M-Pesa sandbox testing
- **Phone Numbers**: Use Safaricom test numbers for sandbox
- **Callback URL**: Must be publicly accessible HTTPS URL

The fixes ensure proper request formatting and better error handling for M-Pesa integration! 🎯
