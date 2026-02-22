// src/types/transaction.types.ts

export interface Transaction {
  amount: number;
  merchant: string;
  dateTime: string; // ISO string
  category: string;
}

export interface TransactionRow extends Transaction {
  rowIndex: number; // Keep track of the row in the sheet
}

export interface TransactionSheet {
  transactions: TransactionRow[];
  fileId: string;
  lastModified: string;
}

export interface UpdateCategoryParams {
  rowIndex: number;
  newCategory: string;
}
