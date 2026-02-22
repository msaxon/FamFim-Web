import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BudgetSheetService } from '../services/drive/budgetSheetService';
import { GoogleDriveService } from '../services/drive/googleDriveService';
import { Budget, FilledBudget, TransactionRow } from '../types';
import { isTransactionInPeriod, parseDate } from '../utils/dateUtils';

const TRANSACTIONS_FILE_ID = '14uW4xiCNMBv7_v2ClU7zYqymNob5xlbCk6EwBJvr8Jw';

interface DataContextState {
  budgets: Budget[];
  filledBudgets: FilledBudget[];
  transactions: TransactionRow[];
  uncategorizedTransactions: TransactionRow[];
  categories: string[];
  loading: boolean;
  puppyGif: string | null;
  loadData: () => Promise<void>;
  updateTransactionCategory: (rowIndex: number, newCategory: string) => Promise<void>;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [puppyGif, setPuppyGif] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsFileId, rawTransactions] = await Promise.all([
        BudgetSheetService.findOrCreateBudgetsFile(),
        GoogleDriveService.getSpreadsheetData(TRANSACTIONS_FILE_ID)
      ]);

      const budgetDefs = await BudgetSheetService.getBudgets(budgetsFileId);
      const allTransactions = GoogleDriveService.parseTransactions(rawTransactions);
      
      setBudgets(budgetDefs);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filledBudgets = React.useMemo(() => {
    return budgets.map(budget => {
      const budgetTransactions = transactions.filter(t => {
        const transactionCategory = (t.category || '').trim().toLowerCase();
        const budgetCategory = (budget.category || '').trim().toLowerCase();
        if (transactionCategory !== budgetCategory) return false;

        const transactionDate = parseDate(t.dateTime);
        if (!transactionDate) return false;
        
        return isTransactionInPeriod(transactionDate, budget.timeWindow, budget.startsOn);
      });
      const currentValue = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { ...budget, transactions: budgetTransactions, currentValue };
    });
  }, [budgets, transactions]);

  const uncategorizedTransactions = React.useMemo(() => {
    return transactions.filter(t => !t.category || t.category.trim() === '');
  }, [transactions]);

  const categories = React.useMemo(() => {
    const budgetCategories = budgets.map(b => b.category);
    return [...new Set(budgetCategories)];
  }, [budgets]);

  useEffect(() => {
    if (uncategorizedTransactions.length === 0 && !loading && !puppyGif) {
      const fetchGif = async () => {
        try {
          const response = await fetch(
            'https://api.giphy.com/v1/gifs/random?api_key=mQjK1QatJLwQEn6K7CALHXrjSORZAVCa&tag=puppy&rating=g'
          );
          const data = await response.json();
          if (data?.data?.images?.fixed_height?.url) {
            setPuppyGif(data.data.images.fixed_height.url);
          }
        } catch (error) {
          console.error('Error fetching GIF:', error);
        }
      };
      fetchGif();
    }
  }, [uncategorizedTransactions.length, loading, puppyGif]);

  const updateTransactionCategory = async (rowIndex: number, newCategory: string) => {
    // Optimistic update
    const originalTransactions = transactions;
    setTransactions(prev => prev.map(t => 
      t.rowIndex === rowIndex ? { ...t, category: newCategory } : t
    ));

    try {
      const range = GoogleDriveService.getCategoryRange(rowIndex);
      await GoogleDriveService.updateCell(TRANSACTIONS_FILE_ID, range, newCategory);
    } catch (error) {
      // Revert on failure
      setTransactions(originalTransactions);
      console.error('Failed to update category:', error);
      throw error; // Re-throw to be caught in the component
    }
  };

  const value = {
    budgets,
    filledBudgets,
    transactions,
    uncategorizedTransactions,
    categories,
    loading,
    puppyGif,
    loadData,
    updateTransactionCategory,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
