import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const BudgetDetailScreen: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { filledBudgets, loading } = useData();

  const budget = filledBudgets.find(b => b.id === budgetId);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!budget) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Budget not found.</div>;
  }

  const percentage = Math.min((budget.currentValue / budget.limit) * 100, 100);
  const isOverBudget = budget.currentValue > budget.limit;

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          background: 'none', 
          border: 'none', 
          fontSize: '16px', 
          color: '#666', 
          marginBottom: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        ← Back
      </button>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{budget.name}</h1>
        <div style={{ color: '#666', marginBottom: '24px' }}>{budget.category}</div>
        
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: isOverBudget ? '#d32f2f' : '#2e7d32', marginBottom: '8px' }}>
          ${budget.currentValue.toFixed(2)}
        </div>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          of ${budget.limit} limit
        </div>

        <div style={{ height: '12px', backgroundColor: '#f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            backgroundColor: isOverBudget ? '#d32f2f' : '#4caf50',
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      <h2 style={{ fontSize: '18px', marginBottom: '16px', paddingLeft: '8px' }}>Transactions (Current Period)</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {budget.transactions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No transactions found</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {budget.transactions.map((t, index) => (
              <li key={index} style={{ 
                borderBottom: index < budget.transactions.length - 1 ? '1px solid #f0f0f0' : 'none', 
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
    </div>
  );
};
