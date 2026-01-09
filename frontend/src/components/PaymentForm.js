import React, { useState } from 'react';

function PaymentForm({ videoId, videoTitle, price, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://video-platform2-api.onrender.com';
      
      const response = await fetch(`${API_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': 'test-user-id'
        },
        body: JSON.stringify({
          phone,
          amount: price,
          videoId
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Payment initiated! Check your phone to complete.');
        // Start polling for payment status
        checkPaymentStatusRepeatedly(result.paymentId);
      } else {
        setMessage(`❌ ${result.error || 'Payment failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://video-platform2-api.onrender.com';
    const response = await fetch(`${API_URL}/api/payments/status/${paymentId}`);
    return await response.json();
  };

  const checkPaymentStatusRepeatedly = (paymentId) => {
    const interval = setInterval(async () => {
      const result = await checkPaymentStatus(paymentId);
      if (result.status === 'success') {
        clearInterval(interval);
        setMessage('🎉 Payment confirmed! Video unlocked.');
        if (onSuccess) onSuccess();
      } else if (result.status === 'failed' || result.status === 'cancelled') {
        clearInterval(interval);
        setMessage('❌ Payment failed. Please try again.');
      }
      // If still pending, continue polling
    }, 3000); // Check every 3 seconds
    
    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!message.includes('confirmed') && !message.includes('failed')) {
        setMessage('⚠️ Payment taking longer than expected. Please check your M-Pesa messages.');
      }
    }, 120000);
  };

  return (
    <div className="payment-form">
      <h3>Pay KSh {price} to unlock "{videoTitle}"</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>M-Pesa Phone Number:</label>
          <input
            type="tel"
            placeholder="e.g., 0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="[0-9]{10}"
            title="Enter 10-digit Kenyan phone number"
          />
          <small>Use test number: <strong>254708374149</strong> (always succeeds)</small>
        </div>

        <div className="form-group">
          <label>Amount (KSh):</label>
          <input
            type="number"
            value={price}
            readOnly
            className="amount-display"
          />
          <small>Test with minimum 1 KSh in sandbox</small>
        </div>

        <button type="submit" disabled={loading} className="pay-btn">
          {loading ? 'Processing...' : `Pay KSh ${price} with M-Pesa`}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('✅') || message.includes('🎉') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="payment-instructions">
        <h4>📱 How to pay (Sandbox Test):</h4>
        <ol>
          <li>Enter <strong>254708374149</strong> as phone number</li>
          <li>Click "Pay with M-Pesa" button</li>
          <li>Wait for simulated STK Push (no actual SMS)</li>
          <li>Payment will auto-confirm in 10-30 seconds</li>
          <li>You'll see confirmation message above</li>
        </ol>
        <p className="note">
          <strong>Note:</strong> This is sandbox/testing mode. No real money is transferred.
        </p>
      </div>
    </div>
  );
}

export default PaymentForm;