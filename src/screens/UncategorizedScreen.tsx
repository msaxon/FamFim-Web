import React, { useEffect, useState } from 'react';
import { GoogleDriveService } from '../services/drive/googleDriveService';
import { TransactionRow } from '../types/transaction.types';
import { useNavigate } from 'react-router-dom';

const TRANSACTIONS_FILE_ID = '14uW4xiCNMBv7_v2ClU7zYqymNob5xlbCk6EwBJvr8Jw';

export const UncategorizedScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUncategorizedTransactions();
  }, []);

  const loadUncategorizedTransactions = async () => {
    try {
      const rawData = await GoogleDriveService.getSpreadsheetData(TRANSACTIONS_FILE_ID);
      const allTransactions = GoogleDriveService.parseTransactions(rawData);
      
      const uncategorized = allTransactions.filter(t => !t.category || t.category.trim() === '');
      setTransactions(uncategorized);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      alert('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Uncategorized</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {transactions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No uncategorized transactions</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {transactions.map((t, index) => (
              <li key={index} style={{ 
                borderBottom: index < transactions.length - 1 ? '1px solid #f0f0f0' : 'none', 
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{t.merchant}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{t.dateTime}</div>
                </div>
                <div style={{ fontWeight: '600' }}>${t.amount.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        <button onClick={() => navigate('/budgets')} style={{ background: 'none', border: 'none', color: '#666' }}>Budgets</button>
        <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: '#666' }}>Transactions</button>
        <button onClick={() => navigate('/uncategorized')} style={{ background: 'none', border: 'none', color: '#4285F4', fontWeight: 'bold' }}>Uncategorized</button>
      </div>
    </div>
  );
};
