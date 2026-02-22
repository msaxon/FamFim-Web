import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { TransactionRow } from '../types';

export const TransactionsScreen: React.FC = () => {
  const { uncategorizedTransactions, loading, updateTransactionCategory, categories, loadData, puppyGif } = useData();
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);

  const handleTransactionClick = (transaction: TransactionRow) => {
    setSelectedTransaction(transaction);
  };

  const handleCategorySelect = async (category: string) => {
    if (!selectedTransaction) return;

    try {
      await updateTransactionCategory(selectedTransaction.rowIndex, category);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Uncategorized Transactions</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {uncategorizedTransactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', margin: '0 0 8px 0' }}>Congratulations!</h2>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 24px 0' }}>You are all caught up.</p>
            
            <button 
              onClick={() => loadData()}
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              Refresh
            </button>

            {puppyGif && (
              <img 
                src={puppyGif} 
                alt="Random puppy" 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
            )}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {uncategorizedTransactions.map((t) => (
              <li key={t.rowIndex} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <button 
                  onClick={() => handleTransactionClick(t)}
                  style={{ 
                    // Reset button styles
                    background: 'none',
                    border: 'none',
                    padding: '16px',
                    margin: 0,
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    // Original styles
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{t.merchant}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{t.dateTime}</div>
                  </div>
                  <div style={{ fontWeight: '600' }}>${t.amount.toFixed(2)}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Category Selection Modal */}
      {selectedTransaction && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.4)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              width: '90%', 
              maxWidth: '400px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>Select a Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...categories, 'Other'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
        padding: '20px 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        <button onClick={() => navigate('/budgets')} style={{ background: 'none', border: 'none', color: '#666', fontSize: '16px' }}>Budgets</button>
        <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: '#4285F4', fontWeight: 'bold', fontSize: '16px' }}>Transactions</button>
      </div>
    </div>
  );
};
