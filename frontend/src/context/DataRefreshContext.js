import React, { createContext, useState, useContext, useCallback } from 'react';

const DataRefreshContext = createContext();

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within DataRefreshProvider');
  }
  return context;
};

export const DataRefreshProvider = ({ children }) => {
  // Track the last refresh timestamp for each data type
  const [refreshTimestamps, setRefreshTimestamps] = useState({
    purchaseOrders: Date.now(),
    procurement: Date.now(),
    payments: Date.now(),
    logistics: Date.now(),
    inventory: Date.now(),
    invoices: Date.now(),
    dashboard: Date.now(),
    reports: Date.now(),
  });

  // Trigger refresh for specific data types
  const triggerRefresh = useCallback((dataTypes = []) => {
    const now = Date.now();
    setRefreshTimestamps(prev => {
      const updated = { ...prev };
      dataTypes.forEach(type => {
        if (type in updated) {
          updated[type] = now;
        }
      });
      return updated;
    });
  }, []);

  // Trigger refresh for ALL data types (used after cascade delete)
  const triggerGlobalRefresh = useCallback(() => {
    const now = Date.now();
    setRefreshTimestamps({
      purchaseOrders: now,
      procurement: now,
      payments: now,
      logistics: now,
      inventory: now,
      invoices: now,
      dashboard: now,
      reports: now,
    });
  }, []);

  // Specific refresh triggers for common operations
  const refreshAfterPOChange = useCallback(() => {
    triggerRefresh(['purchaseOrders', 'procurement', 'payments', 'logistics', 'inventory', 'invoices', 'dashboard', 'reports']);
  }, [triggerRefresh]);

  const refreshAfterProcurementChange = useCallback(() => {
    triggerRefresh(['procurement', 'inventory', 'dashboard', 'reports']);
  }, [triggerRefresh]);

  const refreshAfterPaymentChange = useCallback(() => {
    triggerRefresh(['payments', 'dashboard', 'reports']);
  }, [triggerRefresh]);

  const refreshAfterLogisticsChange = useCallback(() => {
    triggerRefresh(['logistics', 'dashboard', 'reports']);
  }, [triggerRefresh]);

  const refreshAfterInventoryChange = useCallback(() => {
    triggerRefresh(['inventory', 'dashboard', 'reports']);
  }, [triggerRefresh]);

  const refreshAfterInvoiceChange = useCallback(() => {
    triggerRefresh(['invoices', 'dashboard', 'reports']);
  }, [triggerRefresh]);

  return (
    <DataRefreshContext.Provider value={{ 
      refreshTimestamps,
      triggerRefresh,
      triggerGlobalRefresh,
      refreshAfterPOChange,
      refreshAfterProcurementChange,
      refreshAfterPaymentChange,
      refreshAfterLogisticsChange,
      refreshAfterInventoryChange,
      refreshAfterInvoiceChange,
    }}>
      {children}
    </DataRefreshContext.Provider>
  );
};
