// src/types/budget.types.ts

import { TransactionRow } from './transaction.types';

export interface Budget {
  name: string;
  id: string;
  timeWindow: 'weekly' | 'monthly';
  startsOn?: 'monday' | 'sunday';
  limit: number;
  category: string;
}

export interface FilledBudget extends Budget {
  transactions: TransactionRow[];
  currentValue: number; // sum of all transactions in the transactions array
}

export interface BudgetFormData {
  name: string;
  timeWindow: 'weekly' | 'monthly';
  startsOn: 'monday' | 'sunday';
  limit: string; // String for form input, converted to number
  category: string;
}

export interface CreateBudgetParams {
  name: string;
  timeWindow: 'weekly' | 'monthly';
  startsOn?: 'monday' | 'sunday';
  limit: number;
  category: string;
}

export interface UpdateBudgetParams {
  id: string;
  name: string;
  limit: number;
}
