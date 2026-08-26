import React, { createContext, useContext, useState } from 'react';

interface PageContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  dateRangeDays: number;
  setDateRangeDays: (days: number) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [dateRangeDays, setDateRangeDays] = useState<number>(14);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  return (
    <PageContext.Provider value={{
      activePage,
      setActivePage,
      dateRangeDays,
      setDateRangeDays,
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
