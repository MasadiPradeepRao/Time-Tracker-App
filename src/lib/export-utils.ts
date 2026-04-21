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
