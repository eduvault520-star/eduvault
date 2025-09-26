# M-Pesa Payment Setup Guide

## 🚨 **Issues Fixed:**

### **Problem**: Students not receiving M-Pesa prompts and payments going through without actual payment
### **Root Cause**: System was using mock payments in development mode instead of real M-Pesa integration

## 🔧 **Fixes Implemented:**

### **1. Removed Mock Payment Logic**
- ❌ **Before**: System used fake payments in development mode
- ✅ **After**: All payments now go through real M-Pesa API

### **2. Fixed M-Pesa Service Configuration**
- ✅ **Real STK Push**: Uses actual Safaricom M-Pesa API
- ✅ **Proper Error Handling**: Failed payments are properly handled
- ✅ **Callback Processing**: Real payment confirmations processed

### **3. Enhanced Frontend Experience**
- ✅ **Clear Instructions**: Users told to check phone for M-Pesa prompt
- ✅ **Real Status Polling**: Checks actual payment status
- ✅ **No Mock Simulation**: Removed fake payment completion

## 🔧 **Setup Requirements:**

### **1. Environment Variables**
Add these to your `.env` file:
```env
# M-Pesa Sandbox Configuration
MPESA_CONSUMER_KEY=4CNyZAAlMSslZzGGA9QME5XlXpcviHbSC7uTD5Z3mgIrqUOl
MPESA_CONSUMER_SECRET=ecaJR4OMDZlrAoqG6WmQgZG5gvr4gS20w6qrfGZyAYadjp5IevUcO5OGOAuw8pdE
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/subscription/callback
```

### **2. Ngrok Setup (For Local Testing)**
Since M-Pesa needs a public callback URL:

1. **Install Ngrok**: `npm install -g ngrok`
2. **Start your server**: `npm start` (runs on port 5001)
3. **Expose server**: `ngrok http 5001`
4. **Copy HTTPS URL**: Use the https URL from ngrok
5. **Update .env**: Set `MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/subscription/callback`

### **3. Test Phone Numbers (Sandbox)**
Use these test numbers for M-Pesa sandbox:
- `254708374149` - Always succeeds
- `254708374150` - Always fails
- `254708374151` - Times out

## 🔍 **How It Works Now:**

### **1. Payment Initiation**:
```
Student clicks "Subscribe" → Enters phone number → Real M-Pesa STK Push sent → Student receives prompt on phone
```

### **2. Payment Processing**:
```
Student enters M-Pesa PIN → Payment processed by Safaricom → Callback sent to server → Subscription activated
```

### **3. Error Handling**:
```
If STK Push fails → Error shown to student → Subscription marked as failed → No access granted
```

## 📱 **Testing Process:**

### **1. Start Services**:
```bash
# Terminal 1: Start server
cd server
npm start

# Terminal 2: Start ngrok
ngrok http 5001
```

### **2. Update Environment**:
```bash
# Copy ngrok HTTPS URL to .env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/subscription/callback
```

### **3. Test Payment**:
```
1. Login as student
2. Try to access premium content
3. Click "Subscribe to Access"
4. Enter test phone number: 254708374149
5. Check phone for M-Pesa prompt
6. Enter PIN: 1234 (sandbox PIN)
7. Payment should complete and grant access
```

## 📊 **Expected Server Logs:**

### **Successful Payment**:
```
📱 Subscription initiation request received
📱 Creating subscription record...
✅ Subscription saved with ID: 507f1f77bcf86cd799439011
📱 Initiating M-Pesa STK Push...
📱 Initiating STK Push: { phone: '254708374149', amount: 100, reference: 'EDU-507f1f77bcf86cd799439011' }
✅ STK Push initiated successfully: { CheckoutRequestID: 'ws_CO_...', ResponseCode: '0' }
✅ Subscription updated with M-Pesa transaction ID

# Later, when payment completes:
📞 M-Pesa callback received
✅ Payment successful for subscription: 507f1f77bcf86cd799439011
💰 Payment details: { amount: 100, receipt: 'OEI2AK4Q16', phone: '254708374149' }
✅ Subscription activated: 507f1f77bcf86cd799439011
```

### **Failed Payment**:
```
📱 Initiating M-Pesa STK Push...
❌ STK Push initiated successfully but payment failed
📞 M-Pesa callback received
❌ Payment failed for subscription: 507f1f77bcf86cd799439011
❌ Failure reason: Request cancelled by user
```

## 🚀 **Production Setup:**

### **1. Get Production Credentials**:
- Apply for M-Pesa API access from Safaricom
- Get production consumer key/secret
- Get production shortcode and passkey
- Set up production callback URL

### **2. Update Environment**:
```env
NODE_ENV=production
MPESA_CONSUMER_KEY=your_production_key
MPESA_CONSUMER_SECRET=your_production_secret
MPESA_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/subscription/callback
```

## ⚠️ **Important Notes:**

1. **Callback URL Must Be HTTPS**: M-Pesa only calls HTTPS URLs
2. **Phone Number Format**: Must be in format 254XXXXXXXXX
3. **Amount Limits**: Minimum 1 KSH, Maximum 70,000 KSH
4. **Timeout**: STK Push expires after 60 seconds
5. **Network**: User must have sufficient M-Pesa balance

## 🔧 **Troubleshooting:**

### **No STK Push Received**:
- Check phone number format (254XXXXXXXXX)
- Verify phone has network coverage
- Check if phone supports STK Push
- Try different test number

### **Payment Fails**:
- Check M-Pesa balance
- Verify PIN is correct
- Check for network issues
- Review server logs for errors

### **Callback Not Received**:
- Verify ngrok is running
- Check callback URL is HTTPS
- Review ngrok logs
- Ensure server is accessible

## 🎯 **Success Indicators:**

✅ **Student receives M-Pesa prompt on phone**
✅ **Payment requires actual PIN entry**
✅ **Failed payments don't grant access**
✅ **Successful payments activate subscription**
✅ **Real M-Pesa receipt numbers generated**
✅ **Proper error messages for failures**

The system now processes **real M-Pesa payments** instead of mock transactions! 🎉
