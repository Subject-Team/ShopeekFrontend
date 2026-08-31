import React, { createContext, useContext, useState } from 'react';

import { toIsoDate, getDayDifference } from '../utils/jalali';

interface PageContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  dateRangeDays: number;
  setDateRangeDays: (days: number) => void;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  isHistorical: boolean; // true when endDate !== today
  setDateRange: (startIso: string, endIso: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  
  // Default is last 7 days ending today
  const getInitialDates = () => {
    const today = new Date();
    const todayIso = toIsoDate(today);
    const start = new Date(today);
    start.setDate(start.getDate() - 6); // 7 days inclusive: today-6 to today
    return {
      startIso: toIsoDate(start),
      endIso: todayIso,
    };
  };

  const initial = getInitialDates();
  const [startDate, setStartDate] = useState<string>(initial.startIso);
  const [endDate, setEndDate] = useState<string>(initial.endIso);
  const [dateRangeDays, setDaysState] = useState<number>(7);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const todayIso = toIsoDate(new Date());
  const isHistorical = endDate !== todayIso;

  const setDateRange = (startIso: string, endIso: string) => {
    setStartDate(startIso);
    setEndDate(endIso);
    setDaysState(getDayDifference(startIso, endIso));
  };

  const setDateRangeDays = (days: number) => {
    const today = new Date();
    const end = toIsoDate(today);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    const startIso = toIsoDate(start);
    setStartDate(startIso);
    setEndDate(end);
    setDaysState(days);
  };

  return (
    <PageContext.Provider value={{
      activePage,
      setActivePage,
      dateRangeDays,
      setDateRangeDays,
      startDate,
      endDate,
      isHistorical,
      setDateRange,
      isChatOpen,
      setIsChatOpen,
    }}>
      {children}
    </PageContext.Provider>
  );
};


export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within PageContextProvider');
  }
  return context;
};
