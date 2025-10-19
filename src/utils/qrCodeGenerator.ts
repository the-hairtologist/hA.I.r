import QRCode from 'qrcode';

export const generateAppointmentQR = async (appointmentId: string): Promise<string> => {
  try {
    const checkInUrl = `${window.location.origin}/check-in?id=${appointmentId}`;
    const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};
