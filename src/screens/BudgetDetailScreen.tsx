import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js';
import { parseDate, getStartOfWeek, getStartOfMonth, formatDate } from '../utils/dateUtils';
import { TransactionRow } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const BudgetDetailScreen: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { filledBudgets, transactions, loading, categories, updateTransactionCategory } = useData();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);

  const budget = filledBudgets.find(b => b.id === budgetId);

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

  // Historical Data Calculation
  const historicalData = React.useMemo(() => {
    if (!budget) return { historicalBudgetData: [], averageSpent: 0, didNotExceedPercentage: 0 };

    const historicalBudgetData: { period: string; spent: number; date: Date }[] = [];
    let totalSpent = 0;
    let exceededCount = 0;
    let periodCount = 0;

    // Filter transactions for this budget category
    const budgetTransactions = transactions.filter(t => 
      (t.category || '').trim().toLowerCase() === (budget.category || '').trim().toLowerCase()
    );

    // Find the latest transaction date to start iterating backwards from
    let latestDate = new Date();
    if (budgetTransactions.length > 0) {
        const dates = budgetTransactions.map(t => parseDate(t.dateTime)).filter(d => d !== null) as Date[];
        if (dates.length > 0) {
            const maxTransactionDate = new Date(Math.max(...dates.map(d => d.getTime())));
            // If the latest transaction is in the future (relative to system time), use it.
            if (maxTransactionDate > latestDate) {
                latestDate = maxTransactionDate;
            }
        }
    }
    
    const earliestDate = new Date(2026, 1, 1); // Feb 1, 2026

    let currentPeriodStart: Date;
    
    if (budget.timeWindow === 'weekly') {
        currentPeriodStart = getStartOfWeek(latestDate, budget.startsOn);
    } else {
        currentPeriodStart = getStartOfMonth(latestDate);
    }

    // Iterate backwards by period until we reach earliestDate
    while (currentPeriodStart >= earliestDate) {
        let periodEnd: Date;
        let periodLabel: string;

        if (budget.timeWindow === 'weekly') {
            periodEnd = new Date(currentPeriodStart);
            periodEnd.setDate(periodEnd.getDate() + 7);
            periodLabel = formatDate(currentPeriodStart);
        } else {
            periodEnd = new Date(currentPeriodStart);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            periodLabel = `${currentPeriodStart.getFullYear()}-${String(currentPeriodStart.getMonth() + 1).padStart(2, '0')}`;
        }

        // Calculate spent for this period
        const periodSpent = budgetTransactions.reduce((sum, t) => {
            const tDate = parseDate(t.dateTime);
            if (tDate && tDate >= currentPeriodStart && tDate < periodEnd) {
                return sum + t.amount;
            }
            return sum;
        }, 0);

        const spent = parseFloat(periodSpent.toFixed(2));
        
        totalSpent += spent;
        periodCount++;
        if (spent > budget.limit) {
            exceededCount++;
        }

        historicalBudgetData.push({
            period: periodLabel,
            spent,
            date: currentPeriodStart
        });

        // Move to previous period
        if (budget.timeWindow === 'weekly') {
            currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
        } else {
            currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);
        }
    }

    const averageSpent = periodCount > 0 ? totalSpent / periodCount : 0;
    const didNotExceedPercentage = periodCount > 0 ? ((periodCount - exceededCount) / periodCount) * 100 : 0;

    // Reverse to show chronological order (oldest to newest)
    return {
      historicalBudgetData: historicalBudgetData.reverse(),
      averageSpent,
      didNotExceedPercentage,
    };
  }, [budget, transactions]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!budget) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Budget not found.</div>;
  }

  const percentage = Math.min((budget.currentValue / budget.limit) * 100, 100);
  const isOverBudget = budget.currentValue > budget.limit;

  const chartData = {
    labels: historicalData.historicalBudgetData.map(data => data.period),
    datasets: [
      {
        label: 'Amount Spent',
        data: historicalData.historicalBudgetData.map(data => data.spent),
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.4
      },
      {
        label: 'Budget Limit',
        data: Array(historicalData.historicalBudgetData.length).fill(budget.limit),
        borderColor: 'rgba(255,99,132,1)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Historical Budget Performance',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
            callback: function(value: any) {
                return '$' + value;
            }
        }
      }
    }
  };

  // Sort transactions by date descending
  const sortedTransactions = [...budget.transactions].sort((a, b) => {
    const dateA = parseDate(a.dateTime);
    const dateB = parseDate(b.dateTime);
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

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
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        {sortedTransactions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No transactions found</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sortedTransactions.map((t, index) => (
              <li key={index} style={{ borderBottom: index < sortedTransactions.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <button 
                  onClick={() => handleTransactionClick(t)}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    padding: '16px',
                    margin: 0,
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
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

      <h2 style={{ fontSize: '18px', marginBottom: '16px', paddingLeft: '8px' }}>Historical Budget Performance</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {historicalData.historicalBudgetData.length > 0 ? (
          <>
            <Line data={chartData} options={chartOptions} />
            <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Average Spent</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${historicalData.averageSpent.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666' }}>Within Budget</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{historicalData.didNotExceedPercentage.toFixed(0)}%</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#888' }}>No historical data available yet.</div>
        )}
      </div>
    </div>
  );
};
