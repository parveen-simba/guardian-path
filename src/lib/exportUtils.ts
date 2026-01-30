import { TravelAnalysis } from './hospitalData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format date for export
const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Export to CSV
export function exportToCSV(data: TravelAnalysis[], filename: string = 'security-logs'): void {
  const headers = [
    'ID',
    'Staff Name',
    'Staff ID',
    'From Location',
    'To Location',
    'From Time',
    'To Time',
    'Time Gap (min)',
    'Distance (m)',
    'Required Time (min)',
    'Speed (km/h)',
    'Status',
    'Risk Score (%)',
    'Reason'
  ];

  const rows = data.map(row => [
    row.id,
    row.staffName,
    row.staffId,
    row.fromLocation,
    row.toLocation,
    formatDateTime(row.fromTime),
    formatDateTime(row.toTime),
    row.timeGapMinutes.toFixed(2),
    row.distanceMeters.toFixed(2),
    row.requiredTimeMinutes.toFixed(2),
    row.speedKmh.toFixed(2),
    row.status.toUpperCase(),
    row.riskScore.toFixed(2),
    row.reason
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to PDF
export function exportToPDF(data: TravelAnalysis[], filename: string = 'security-logs'): void {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Header
  doc.setFillColor(15, 23, 42); // Dark background
  doc.rect(0, 0, 297, 40, 'F');
  
  doc.setTextColor(0, 229, 160); // Primary green
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSPITAL SENTINEL', 14, 18);
  
  doc.setTextColor(148, 163, 184); // Muted text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Cyber-Physical Security Platform — Compliance Audit Report', 14, 26);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
  
  // Summary stats
  const totalRecords = data.length;
  const safeCount = data.filter(d => d.status === 'safe').length;
  const suspiciousCount = data.filter(d => d.status === 'suspicious').length;
  const impossibleCount = data.filter(d => d.status === 'impossible').length;
  
  doc.setFillColor(30, 41, 59);
  doc.rect(14, 45, 269, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 20, 54);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Records: ${totalRecords}`, 60, 54);
  
  doc.setTextColor(0, 229, 160);
  doc.text(`Safe: ${safeCount}`, 120, 54);
  
  doc.setTextColor(255, 149, 0);
  doc.text(`Suspicious: ${suspiciousCount}`, 160, 54);
  
  doc.setTextColor(255, 59, 92);
  doc.text(`Fraud Alerts: ${impossibleCount}`, 210, 54);
  
  // Table data
  const tableData = data.map(row => [
    row.staffName,
    row.fromLocation,
    row.toLocation,
    row.timeGapMinutes.toFixed(1) + ' min',
    row.distanceMeters.toFixed(0) + ' m',
    row.speedKmh.toFixed(1) + ' km/h',
    row.riskScore.toFixed(0) + '%',
    row.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['Staff', 'From', 'To', 'Time Gap', 'Distance', 'Speed', 'Risk', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [0, 229, 160],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fillColor: [30, 41, 59],
      textColor: [226, 232, 240],
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: [51, 65, 85]
    },
    columnStyles: {
      7: {
        cellWidth: 25,
        fontStyle: 'bold'
      }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 7) {
        const status = data.cell.raw as string;
        if (status === 'IMPOSSIBLE' || status === 'FRAUD ALERT') {
          data.cell.styles.textColor = [255, 59, 92];
        } else if (status === 'SUSPICIOUS') {
          data.cell.styles.textColor = [255, 149, 0];
        } else {
          data.cell.styles.textColor = [0, 229, 160];
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 200, 297, 10, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} | Hospital Sentinel Security Report | Confidential`,
      148,
      206,
      { align: 'center' }
    );
  }

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}
