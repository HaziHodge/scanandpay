const QRCode = require('qrcode');

const generateTableQR = async (venueSlug, tableId) => {
  const url = `${process.env.FRONTEND_URL}/menu/${venueSlug}/${tableId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR Generate Error', err);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateTableQR
};
