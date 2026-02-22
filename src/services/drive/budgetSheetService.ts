import { authenticatedFetch } from '../auth/authManager';
import { Budget, CreateBudgetParams } from '../../types/budget.types';
import { GoogleDriveService } from './googleDriveService';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const BUDGETS_FILE_NAME = 'Budgets';

export class BudgetSheetService {
  /**
   * Find or create the Budgets spreadsheet
   */
  static async findOrCreateBudgetsFile(): Promise<string> {
    // Try to find existing file
    let fileId = await GoogleDriveService.findFileByName(BUDGETS_FILE_NAME);
    
    if (fileId) {
      return fileId;
    }

    // File doesn't exist, create it
    console.log('Budgets file not found, creating new one...');
    fileId = await this.createBudgetsFile();
    return fileId;
  }

  /**
   * Create a new Budgets spreadsheet with headers
   */
  static async createBudgetsFile(): Promise<string> {
    // TODO: Add error handling for file creation failures
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: BUDGETS_FILE_NAME,
        },
        sheets: [
          {
            properties: {
              title: 'Sheet1',
            },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'ID' } },
                      { userEnteredValue: { stringValue: 'Name' } },
                      { userEnteredValue: { stringValue: 'TimeWindow' } },
                      { userEnteredValue: { stringValue: 'StartsOn' } },
                      { userEnteredValue: { stringValue: 'Limit' } },
                      { userEnteredValue: { stringValue: 'Category' } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Created Budgets spreadsheet with ID:', data.spreadsheetId);
    return data.spreadsheetId;
  }

  /**
   * Get all budgets from the spreadsheet
   */
  static async getBudgets(fileId: string): Promise<Budget[]> {
    const rawData = await GoogleDriveService.getSpreadsheetData(fileId, 'Sheet1');
    
    if (rawData.length === 0) {
      return [];
    }

    // Skip header row
    const dataRows = rawData.slice(1);
    
    // Filter out empty rows (sometimes API returns trailing empty rows)
    const validRows = dataRows.filter(row => row && row.length > 0 && row[0]);

    return validRows.map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      timeWindow: (row[2] || 'monthly') as 'weekly' | 'monthly',
      startsOn: row[3] ? (row[3] as 'monday' | 'sunday') : undefined,
      limit: parseFloat(row[4]) || 0,
      category: row[5] || '',
    }));
  }

  /**
   * Add a new budget to the spreadsheet
   */
  static async createBudget(
    fileId: string,
    params: CreateBudgetParams
  ): Promise<Budget> {
    const id = this.generateBudgetId();
    
    const budget: Budget = {
      id,
      name: params.name,
      timeWindow: params.timeWindow,
      startsOn: params.startsOn,
      limit: params.limit,
      category: params.category,
    };

    // Append the new budget row
    const url = `${SHEETS_API_BASE}/${fileId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`;
    
    const row = [
      budget.id,
      budget.name,
      budget.timeWindow,
      budget.startsOn || '',
      budget.limit.toString(),
      budget.category,
    ];

    await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    console.log('Created budget:', budget.name);
    return budget;
  }

  /**
   * Update an existing budget (name and limit only)
   */
  static async updateBudget(
    fileId: string,
    budgetId: string,
    name: string,
    limit: number
  ): Promise<void> {
    // Get all budgets to find the row index
    const rawData = await GoogleDriveService.getSpreadsheetData(fileId, 'Sheet1');
    
    // Find the row with this budget ID (skip header)
    const rowIndex = rawData.slice(1).findIndex(row => row[0] === budgetId);
    
    if (rowIndex === -1) {
      throw new Error('Budget not found');
    }

    // Row index is +2 (1 for header, 1 for 0-based to 1-based)
    const actualRowIndex = rowIndex + 2;

    // Update name (column B)
    await GoogleDriveService.updateCell(
      fileId,
      `Sheet1!B${actualRowIndex}`,
      name
    );

    // Update limit (column E)
    await GoogleDriveService.updateCell(
      fileId,
      `Sheet1!E${actualRowIndex}`,
      limit.toString()
    );

    console.log('Updated budget:', budgetId);
  }

  /**
   * Generate a unique budget ID
   */
  static generateBudgetId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
