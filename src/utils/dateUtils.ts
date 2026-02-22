export const parseDate = (dateString: string): Date | null => {
  const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) (AM|PM) (ET|EST|EDT)/);
  if (!parts) {
    // Try standard date parsing as fallback
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
  
  const [, month, day, year, hour, minute, ampm] = parts;
  
  let hour24 = parseInt(hour, 10);
  if (ampm === 'PM' && hour24 < 12) {
    hour24 += 12;
  }
  if (ampm === 'AM' && hour24 === 12) {
    hour24 = 0;
  }

  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hour24, parseInt(minute, 10));
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
