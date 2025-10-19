import { jsPDF } from 'jspdf';

interface ReceiptData {
  appointmentId: string;
  clientName: string;
  stylistName: string;
  businessName: string;
  serviceType: string;
  appointmentDate: string;
  price: number;
  notes?: string;
}

export const generateReceipt = async (data: ReceiptData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(128, 0, 128); // Purple
  doc.text('hA.I.r', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Receipt', pageWidth / 2, 28, { align: 'center' });
  
  // Business Info
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(data.businessName, 20, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Stylist: ${data.stylistName}`, 20, 52);
  
  // Divider
  doc.setDrawColor(200);
  doc.line(20, 60, pageWidth - 20, 60);
  
  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Client Information', 20, 70);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Name: ${data.clientName}`, 20, 78);
  doc.text(`Date: ${data.appointmentDate}`, 20, 85);
  
  // Service Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Service Details', 20, 100);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Service: ${data.serviceType}`, 20, 108);
  
  if (data.notes) {
    doc.text('Notes:', 20, 115);
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40);
    doc.text(splitNotes, 20, 122);
  }
  
  // Divider
  doc.line(20, 135, pageWidth - 20, 135);
  
  // Total
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Total Amount', 20, 145);
  doc.text(`$${data.price.toFixed(2)}`, pageWidth - 20, 145, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Thank you for your business!', pageWidth / 2, 160, { align: 'center' });
  doc.text(`Receipt ID: ${data.appointmentId}`, pageWidth / 2, 166, { align: 'center' });
  
  // Save
  doc.save(`receipt-${data.appointmentId}.pdf`);
};
