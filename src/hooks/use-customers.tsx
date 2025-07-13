
"use client";

import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react';
import type { Customer, Transaction, TransactionPayload, SalePurchaseDetails, MetalExchangeDetails, TunchDetails, GoldCashTransactionDetails, ShopTransaction, LiveRates } from '@/lib/types';
import { useToast } from './use-toast';

interface CustomerContextType {
  customers: Customer[];
  shopTransactions: ShopTransaction[];
  liveRates: LiveRates;
  getCustomer: (id: number) => Customer | undefined;
  addCustomer: (customerData: Omit<Customer, 'id' | 'transactions' | 'cashBalance' | 'goldBalance' | 'silverBalance'>) => Customer;
  updateCustomer: (id: number, updatedData: Partial<Omit<Customer, 'id' | 'transactions' | 'cashBalance' | 'goldBalance' | 'silverBalance'>>) => void;
  deleteCustomer: (id: number) => void;
  addTransaction: (
    customerId: number | undefined, 
    payload: TransactionPayload
  ) => void;
  updateLiveRates: (metal: 'gold' | 'silver', newRates: { buy: number; sell: number }) => void;
  clearAllData: () => void;
  clearAllTransactions: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const initialRates: LiveRates = {
    gold: { buy: 6850, sell: 7050 },
    silver: { buy: 85, sell: 90 },
};

// Helper functions to interact with localStorage
const saveDataToLocalStorage = (data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('gauri-khata-data', JSON.stringify(data));
    }
}

const loadDataFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('gauri-khata-data');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Ensure rates are loaded, or use initial rates as a fallback
            if (!parsedData.liveRates) {
                parsedData.liveRates = initialRates;
            }
            return parsedData;
        }
    }
    return { customers: [], shopTransactions: [], customerIdCounter: 0, transactionIdCounter: 0, liveRates: initialRates };
}


export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shopTransactions, setShopTransactions] = useState<ShopTransaction[]>([]);
  const [customerIdCounter, setCustomerIdCounter] = useState(0);
  const [transactionIdCounter, setTransactionIdCounter] = useState(0);
  const [liveRates, setLiveRates] = useState<LiveRates>(initialRates);
  const { toast } = useToast();

  // Load initial data from localStorage
  useEffect(() => {
    async function fetchCustomers() {
      if (window.api?.getCustomers && window.api?.getCustomerTransactions) {
        const data = await window.api.getCustomers();
        const hydrated = await Promise.all(
          data.map(async c => ({
            id: c.id ?? 0,
            name: c.name,
            phone: c.phone,
            pan: c.pan ?? "",
            notes: c.notes ?? "",
            photo_path: c.photo_path ?? "",
            aadhar_front_path: c.aadhar_front_path ?? "",
            aadhar_back_path: c.aadhar_back_path ?? "",
            transactions: await window.api.getCustomerTransactions(Number(c.id)),
            cashBalance: c.cashBalance ?? 0,
            goldBalance: c.goldBalance ?? 0,
            silverBalance: c.silverBalance ?? 0
          }))
        );
        setCustomers(hydrated);
      }
    }
    fetchCustomers();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveDataToLocalStorage({ customers, shopTransactions, customerIdCounter, transactionIdCounter, liveRates });
  }, [customers, shopTransactions, customerIdCounter, transactionIdCounter, liveRates]);

  const updateLiveRates = useCallback((metal: 'gold' | 'silver', newRates: { buy: number; sell: number }) => {
    setLiveRates(prev => ({ ...prev, [metal]: newRates }));
  }, []);


  const getCustomer = useCallback((id: number): Customer | undefined => {
    return customers.find((c) => c.id === id);
  }, [customers]);

  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'transactions' | 'cashBalance' | 'goldBalance' | 'silverBalance'>) => {
    const newId = customerIdCounter + 1;
    setCustomerIdCounter(newId);
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      transactions: [],
      cashBalance: 0,
      goldBalance: 0,
      silverBalance: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  }, [customerIdCounter]);

  const updateCustomer = useCallback((id: number, updatedData: Partial<Omit<Customer, 'id' | 'transactions' | 'cashBalance' | 'goldBalance' | 'silverBalance'>>) => {
    setCustomers(prev =>
      prev.map(c => c.id === id ? { ...c, ...updatedData } : c)
    );
  }, []);

  const deleteCustomer = useCallback((id: number) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);
  
  const clearAllData = useCallback(() => {
    setCustomers([]);
    setShopTransactions([]);
    setCustomerIdCounter(0);
    setTransactionIdCounter(0);
    setLiveRates(initialRates); // Reset rates as well
    toast({
        title: "Database Cleared",
        description: "All customer and transaction data has been removed.",
        variant: "destructive"
    });
  }, [toast]);
  
  const clearAllTransactions = useCallback(() => {
    setCustomers(prev => prev.map(c => ({
        ...c,
        transactions: [],
        cashBalance: 0,
        goldBalance: 0,
        silverBalance: 0,
    })));
    setShopTransactions([]);
    setTransactionIdCounter(0);
    toast({
        title: "Transactions Cleared",
        description: "All transaction history has been removed.",
        variant: "destructive"
    });
  }, [toast]);

  const addTransaction = useCallback((
    customerId: number | undefined, 
    payload: TransactionPayload
  ) => {
    const newTxId = transactionIdCounter + 1;
    setTransactionIdCounter(newTxId);
    
    // Handle Shop Transactions
    if (!customerId) {
        if (payload.category === 'CashIn' || payload.category === 'CashOut') {
             const newShopTransaction: ShopTransaction = {
                id: `t${newTxId}`,
                timestamp: new Date().toISOString(),
                category: payload.category,
                details: payload.details as GoldCashTransactionDetails,
             };
             setShopTransactions(prev => [...prev, newShopTransaction].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
             
             return;
        }
        return; 
    }

    // Handle Customer Transactions
    setCustomers(prev => {
      const newCustomers = prev.map(customer => {
        if (customer.id === customerId) {
          
          let cashChange = 0;
          let goldChange = 0;
          let silverChange = 0;

          switch (payload.category) {
              case 'Tunch':
                  cashChange = -(payload.details as TunchDetails).tunchCharges; 
                  break;
              case 'MetalExchange':
                  const exchangeDetails = payload.details as MetalExchangeDetails;
                  cashChange = -exchangeDetails.finalAmount;
                  goldChange = exchangeDetails.metalReturned - exchangeDetails.totalFineWeight;
                  break;
              case 'Sale': // Shop sells to customer
                  const saleDetails = payload.details as SalePurchaseDetails;
                  cashChange = saleDetails.amountPaid - saleDetails.totalAmount;
                  if (saleDetails.metal === 'gold') goldChange = saleDetails.weight;
                  else silverChange = saleDetails.weight;
                  break;
              case 'Purchase': // Shop buys from customer
                  const purchaseDetails = payload.details as SalePurchaseDetails;
                  cashChange = purchaseDetails.totalAmount - purchaseDetails.amountPaid;
                   if (purchaseDetails.metal === 'gold') goldChange = -purchaseDetails.weight;
                   else silverChange = -purchaseDetails.weight;
                  break;
              case 'GoldIn': // Customer gives gold to shop, their gold balance decreases
                    const goldInDetails = payload.details as GoldCashTransactionDetails;
                    goldChange = -goldInDetails.amount;
                    cashChange = goldInDetails.cashValue ?? 0;
                    break;
              case 'GoldOut': // Customer receives gold from shop, their gold balance increases
                    const goldOutDetails = payload.details as GoldCashTransactionDetails;
                    goldChange = goldOutDetails.amount;
                    cashChange = -(goldOutDetails.cashValue ?? 0);
                    break;
              case 'SilverIn':
                    const silverInDetails = payload.details as GoldCashTransactionDetails;
                    silverChange = -silverInDetails.amount;
                    cashChange = silverInDetails.cashValue ?? 0;
                    break;
              case 'SilverOut':
                    const silverOutDetails = payload.details as GoldCashTransactionDetails;
                    silverChange = silverOutDetails.amount;
                    cashChange = -(silverOutDetails.cashValue ?? 0);
                    break;
              case 'CashIn': // Customer pays cash to shop, their balance with shop decreases
                    cashChange = -(payload.details as GoldCashTransactionDetails).amount;
                    break;
              case 'CashOut': // Customer receives cash from shop, their balance with shop increases
                    cashChange = (payload.details as GoldCashTransactionDetails).amount;
                    break;
          }

          const cashBalanceAfter = customer.cashBalance + cashChange;
          const goldBalanceAfter = customer.goldBalance + goldChange;
          const silverBalanceAfter = customer.silverBalance + silverChange;

          const newTransaction: Transaction = {
            id: newTxId,
            timestamp: new Date().toISOString(),
            category: payload.category,
            details: payload.details,
            cashChange: cashChange,
            goldChange: goldChange,
            silverChange: silverChange,
            cashBalanceAfter,
            goldBalanceAfter,
            silverBalanceAfter,
          };
          
          const updatedTransactions = [newTransaction, ...customer.transactions].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          const updatedCustomer: Customer = {
            ...customer,
            transactions: updatedTransactions,
            cashBalance: cashBalanceAfter,
            goldBalance: goldBalanceAfter,
            silverBalance: silverBalanceAfter,
          };
          
          return updatedCustomer;
        }
        return customer;
      });
      return newCustomers;
    });
  }, [transactionIdCounter]);
  
  const value = {
      customers,
      shopTransactions,
      liveRates,
      getCustomer,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addTransaction,
      updateLiveRates,
      clearAllData,
      clearAllTransactions,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
