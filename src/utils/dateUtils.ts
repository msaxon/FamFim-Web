export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Try parsing "MM/DD/YYYY HH:mm AM/PM" format
  const parts = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
  
  if (parts) {
    const [, month, day, year, hour, minute, ampm] = parts;
    let hour24 = parseInt(hour, 10);
    
    if (ampm.toUpperCase() === 'PM' && hour24 < 12) {
      hour24 += 12;
    }
    if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hour24, parseInt(minute, 10));
  }

  // Try standard date parsing as fallback
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const isTransactionInPeriod = (transactionDate: Date, timeWindow: 'weekly' | 'monthly', startsOn?: 'monday' | 'sunday') => {
  const now = new Date();
  let start: Date;
  let end: Date;

  // Reset time part for accurate date comparison
  const checkDate = new Date(transactionDate);
  checkDate.setHours(0, 0, 0, 0);

  if (timeWindow === 'weekly') {
    const day = now.getDay(); // 0 is Sunday
    // Calculate start of the week
    const diff = now.getDate() - day + (startsOn === 'monday' ? (day === 0 ? -6 : 1) : 0);
    start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
    end.setHours(0, 0, 0, 0);
  }

  return checkDate.getTime() >= start.getTime() && checkDate.getTime() < end.getTime();
};

export const calculateTimeProgress = (timeWindow: 'weekly' | 'monthly', startsOn?: 'monday' | 'sunday') => {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (timeWindow === 'weekly') {
    const day = now.getDay();
    const diff = now.getDate() - day + (startsOn === 'monday' ? (day === 0 ? -6 : 1) : 0);
    start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  
  const total = end.getTime() - start.getTime();
  const current = now.getTime() - start.getTime();
  return Math.min(Math.max(current / total, 0), 1) * 100;
};

export const getStartOfWeek = (date: Date, startsOn: 'monday' | 'sunday' = 'monday'): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (startsOn === 'monday' ? (day === 0 ? -6 : 1) : 0);
  const start = new Date(d);
  start.setDate(diff);
  return start;
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};
