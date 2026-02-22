import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { calculateTimeProgress } from '../utils/dateUtils';

export const BudgetsScreen: React.FC = () => {
  const { filledBudgets, loading } = useData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading budgets...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Budgets</h1>
        <button 
          onClick={() => navigate('/create-budget')}
          style={{
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          +
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filledBudgets.map((budget) => {
          const spendPercentage = (budget.currentValue / budget.limit) * 100;
          const timePercentage = calculateTimeProgress(budget.timeWindow, budget.startsOn);
          const isOverBudget = budget.currentValue > budget.limit;

          return (
            <button 
              key={budget.id} 
              onClick={() => navigate(`/budget/${budget.id}`)}
              style={{ 
                // Reset button styles
                background: 'none',
                margin: 0,
                font: 'inherit',
                color: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                // Original card styles
                display: 'block',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{budget.name}</h3>
                <span style={{ fontSize: '14px', color: '#666', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '12px' }}>
                  {budget.category}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>Spent</span>
                  <span style={{ fontWeight: '500', color: isOverBudget ? '#d32f2f' : '#2e7d32' }}>
                    ${budget.currentValue.toFixed(2)} / ${budget.limit}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(spendPercentage, 100)}%`, 
                    backgroundColor: isOverBudget ? '#d32f2f' : '#4caf50',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>Time Elapsed</span>
                  <span style={{ color: '#666' }}>{Math.round(timePercentage)}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${timePercentage}%`, 
                    backgroundColor: '#2196f3',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
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
        <button onClick={() => navigate('/budgets')} style={{ background: 'none', border: 'none', color: '#4285F4', fontWeight: 'bold', fontSize: '16px' }}>Budgets</button>
        <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: '#666', fontSize: '16px' }}>Transactions</button>
      </div>
    </div>
  );
};
