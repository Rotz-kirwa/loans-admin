import Papa from 'papaparse';
import { formatDateTime, formatKESFull, statusLabel, methodLabel } from './format';

const toRow = (loan) => ({
  ID: loan.id,
  Name: loan.name || `${loan.first_name || ''} ${loan.last_name || ''}`.trim(),
  Phone: loan.phone || '',
  'M-PESA Phone': loan.mpesa_phone || '',
  'Loan Amount (KES)': loan.amount || 0,
  'Paid Amount (KES)': loan.paid_amount || 0,
  'Payment Status': statusLabel(loan.payment_status),
  'App Status': loan.status || '',
  'Receipt No.': loan.mpesa_receipt_number || '',
  'Checkout Request ID': loan.mpesa_checkout_request_id || '',
  Method: methodLabel(loan),
  'Requested At': formatDateTime(loan.mpesa_requested_at),
  'Paid At': formatDateTime(loan.payment_received_at),
  'Created At': formatDateTime(loan.created_at),
});

export const exportCSV = (rows, filename = 'transactions.csv') => {
  const csv = Papa.unparse(rows.map(toRow));
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportPDF = async (rows, filename = 'transactions.pdf') => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Loanvia — Transaction Report', 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const columns = ['ID', 'Name', 'Phone', 'Loan Amt', 'Paid Amt', 'Status', 'Receipt', 'Method', 'Paid At'];
  const data = rows.map((loan) => [
    loan.id,
    loan.name || `${loan.first_name || ''} ${loan.last_name || ''}`.trim(),
    loan.mpesa_phone || loan.phone || '',
    formatKESFull(loan.amount),
    formatKESFull(loan.paid_amount),
    statusLabel(loan.payment_status),
    loan.mpesa_receipt_number || '—',
    methodLabel(loan),
    formatDateTime(loan.payment_received_at),
  ]);

  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 28,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 255] },
  });

  doc.save(filename);
};
