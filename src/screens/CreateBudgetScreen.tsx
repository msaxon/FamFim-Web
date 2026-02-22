import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BudgetSheetService } from '../services/drive/budgetSheetService';
import { CreateBudgetParams } from '../types/budget.types';

export const CreateBudgetScreen: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [category, setCategory] = useState('');
  const [timeWindow, setTimeWindow] = useState<'weekly' | 'monthly'>('monthly');
  const [startsOn, setStartsOn] = useState<'monday' | 'sunday'>('sunday');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fileId = await BudgetSheetService.findOrCreateBudgetsFile();
      const params: CreateBudgetParams = {
        name,
        limit: parseFloat(limit),
        category,
        timeWindow,
        startsOn: timeWindow === 'weekly' ? startsOn : undefined,
      };
      await BudgetSheetService.createBudget(fileId, params);
      navigate('/budgets');
    } catch (error) {
      console.error('Failed to create budget:', error);
      alert('Failed to create budget');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Budget</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Budget Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          placeholder="Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ padding: '8px' }}
        />
        <select 
          value={timeWindow} 
          onChange={(e) => setTimeWindow(e.target.value as 'weekly' | 'monthly')}
          style={{ padding: '8px' }}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
        {timeWindow === 'weekly' && (
          <select 
            value={startsOn} 
            onChange={(e) => setStartsOn(e.target.value as 'monday' | 'sunday')}
            style={{ padding: '8px' }}
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </select>
        )}
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          Create
        </button>
      </form>
    </div>
  );
};
