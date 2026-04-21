import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadPDF(filename: string, titleText: string, rows: Record<string, string | number>[], totalDurationText: string) {
    if (!rows || !rows.length) {
        return;
    }

    const doc = new jsPDF();
    
    // Add "Hourlog" at the top
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600 color
    doc.text("Hourlog", 14, 20);
    
    // Add Title (e.g. Monthly Shift Timings - User Name)
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(titleText, 14, 30);
    
    const headers = Object.keys(rows[0]);
    const dRows = rows.map(row => headers.map(header => row[header] === null || row[header] === undefined ? '' : String(row[header])));

    autoTable(doc, {
        head: [headers],
        body: dRows,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 10 },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 35;
    
    // Add Total Duration at the bottom
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Monthly Hours Worked: ${totalDurationText}`, 14, finalY + 10);
    
    doc.save(filename);
}

export function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
    if (!rows || !rows.length) {
        return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => 
            headers.map(header => {
                const cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
                // Escape commas and quotes
                return `"${cell.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
