const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 data URL
 * @param {string} data - the string to encode (e.g., bookingId)
 * @returns {Promise<string>} base64 data URL
 */
exports.generateQRCode = async (data) => {
  try {
    const url = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: { dark: '#1f2937', light: '#ffffff' },
    });
    return url;
  } catch (err) {
    console.error('QR Code generation error:', err);
    return null;
  }
};
