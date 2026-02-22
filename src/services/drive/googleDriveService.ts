import { authenticatedFetch } from '../auth/authManager';
import { TransactionRow } from '../../types/transaction.types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export class GoogleDriveService {
  /**
   * Search for a file by name in Google Drive
   */
  static async findFileByName(fileName: string): Promise<string | null> {
    try {
      // Search for non-trashed files with the given name
      const query = encodeURIComponent(`name='${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
      const url = `${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`;
      
      const response = await authenticatedFetch(url);
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        // Since we ordered by modifiedTime desc, the first one is the most recent
        console.log(`Found ${data.files.length} file(s) named "${fileName}". Using most recent ID: ${data.files[0].id}`);
        return data.files[0].id;
      }
      
      console.warn(`File "${fileName}" not found in Google Drive`);
      return null;
    } catch (error) {
      console.error('Error searching for file:', error);
      throw new Error('Failed to search for file in Google Drive');
    }
  }

  /**
   * Get spreadsheet data by file ID
   */
  static async getSpreadsheetData(fileId: string, range: string = 'Sheet1'): Promise<any[][]> {
    try {
      const url = `${SHEETS_API_BASE}/${fileId}/values/${range}`;
      const response = await authenticatedFetch(url);
      const data = await response.json();
      
      return data.values || [];
    } catch (error) {
      console.error('Error fetching spreadsheet data:', error);
      throw new Error('Failed to fetch spreadsheet data');
    }
  }

  /**
   * Update a single cell in the spreadsheet
   */
  static async updateCell(
    fileId: string,
    range: string,
    value: string
  ): Promise<void> {
    try {
      const url = `${SHEETS_API_BASE}/${fileId}/values/${range}?valueInputOption=RAW`;
      
      const response = await authenticatedFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[value]],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update cell: ${response.statusText}`);
      }

      console.log(`Updated cell ${range} successfully`);
    } catch (error) {
      console.error('Error updating cell:', error);
      throw new Error('Failed to update spreadsheet cell');
    }
  }

  /**
   * Parse raw spreadsheet data into Transaction objects
   */
  static parseTransactions(rawData: any[][]): TransactionRow[] {
    if (rawData.length === 0) {
      return [];
    }

    // Skip header row (index 0)
    const dataRows = rawData.slice(1);
    
    return dataRows.map((row, index) => {
      // Row index is index + 2 (1 for header, 1 for 0-based to 1-based)
      const rowIndex = index + 2;
      
      // Clean amount string (remove currency symbols, commas)
      const amountStr = (row[0] || '').toString().replace(/[$,]/g, '');
      const amount = parseFloat(amountStr) || 0;

      return {
        amount,
        merchant: row[1] || '',
        dateTime: row[2] || '',
        category: row[3] || '',
        rowIndex,
      };
    });
  }

  /**
   * Get the cell range for a category update
   */
  static getCategoryRange(rowIndex: number, sheetName: string = 'Sheet1'): string {
    // Category is in column D (4th column)
    return `${sheetName}!D${rowIndex}`;
  }
}
