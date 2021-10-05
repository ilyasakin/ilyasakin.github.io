import { Context, createContext, useContext, useState } from 'react';
import { IPagination } from '../types/IPagination';

export interface IPaginationContext {
  pagination: IPagination;
  setPagination: React.Dispatch<React.SetStateAction<IPagination>>;
}

export const PaginationContext: Context<IPaginationContext> = createContext(
  {} as IPaginationContext,
);

export const PaginationProvider: React.FC<{ initialValue: IPagination }> = ({
  initialValue,
  children,
}) => {
  const [pagination, setPagination] = useState(initialValue);

  return (
    <PaginationContext.Provider value={{ pagination, setPagination }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination: () => IPaginationContext = () => useContext(PaginationContext);
