/**
 * CSV Export Utility
 * Converts data arrays to CSV and triggers download
 */

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  );

  // Create CSV header
  const header = allKeys.join(',');

  // Create CSV rows
  const rows = data.map(obj => {
    return allKeys.map(key => {
      const value = obj[key];
      
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      
      // Handle arrays/objects
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      // Handle strings with commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Format data for export (flatten nested objects)
 */
export const formatDataForExport = (data: any[]): any[] => {
  return data.map(item => {
    const flattened: any = {};
    
    Object.keys(item).forEach(key => {
      const value = item[key];
      
      // Flatten nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach(nestedKey => {
          flattened[`${key}_${nestedKey}`] = value[nestedKey];
        });
      } else {
        flattened[key] = value;
      }
    });
    
    return flattened;
  });
};
