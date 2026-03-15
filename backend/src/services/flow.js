const crypto = require('crypto');
const axios = require('axios');

class FlowService {
  constructor() {
    this.apiUrl = process.env.FLOW_API_URL;
    this.apiKey = process.env.FLOW_API_KEY;
    this.secretKey = process.env.FLOW_SECRET_KEY;
  }

  _sign(params) {
    const sortedKeys = Object.keys(params).sort();
    let toSign = '';
    for (const key of sortedKeys) {
      toSign += `${key}${params[key]}`;
    }
    return crypto.createHmac('sha256', this.secretKey).update(toSign).digest('hex');
  }

  async createPayment(order, venue) {
    const params = {
      apiKey: this.apiKey,
      commerceOrder: order.id,
      subject: `Pedido #${order.id.slice(0, 8)} - ${venue.name}`,
      currency: 'CLP',
      amount: order.total,
      email: '', // Optional, empty string if not provided
      urlConfirmation: `${process.env.API_URL}/api/webhooks/flow`,
      urlReturn: `${process.env.FRONTEND_URL}/menu/${venue.slug}/confirmacion/${order.id}`
    };

    const signature = this._sign(params);
    params.s = signature;

    const response = await axios.post(`${this.apiUrl}/payment/create`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data && response.data.url && response.data.token) {
      return {
        url: response.data.url,
        token: response.data.token,
        paymentUrl: `${response.data.url}?token=${response.data.token}`
      };
    }
    throw new Error('Flow Create Payment failed');
  }

  async getPaymentStatus(token) {
    const params = {
      apiKey: this.apiKey,
      token: token
    };

    const signature = this._sign(params);
    params.s = signature;

    const queryStr = new URLSearchParams(params).toString();
    const response = await axios.get(`${this.apiUrl}/payment/getStatus?${queryStr}`);
    
    return response.data;
  }
}

module.exports = new FlowService();
