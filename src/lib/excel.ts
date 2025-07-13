import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file.
 * @param data The array of objects to export.
 * @param fileName The name of the file to be created (without extension).
 * @param sheetName The name of the worksheet inside the Excel file.
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName: string
): void {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert the data to a worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write the workbook and trigger a download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
