type Customer = {
  id?: number;
  name: string;
  phone: string;
  pan: string;
  notes?: string;
  cashBalance?: number;
  goldBalance?: number;
  silverBalance?: number;
  photo_path?: string;
  aadhar_front_path?: string;
  aadhar_back_path?: string;
};

// Transaction linked to a customer
export type CustomerTransaction = {
  id?: number;
  customer_id: number;
  timestamp: string;
  category: string;
  details: any; // JSON object (type, metal, weight, etc.)
  cashBalanceAfter?: number;
  cashChange?: number;
  goldBalanceAfter?: number;
  goldChange?: number;
  silverBalanceAfter?: number;
  silverChange?: number;
};

// Shop-level transaction
export type ShopTransaction = {
  id: string;
  timestamp: string;
  category: string;
  details: any; // JSON object (type, amount, remarks, etc.)
};

declare global {
  interface Window {
    api: {
      // Customers
      getCustomers: () => Promise<Customer[]>;
      addCustomer: (customer: Customer) => Promise<Customer>;
      // Customer Transactions
      getCustomerTransactions: (customerId: number) => Promise<CustomerTransaction[]>;
      addCustomerTransaction: (txn: CustomerTransaction) => Promise<CustomerTransaction>;
      // Shop Transactions
      getShopTransactions: () => Promise<ShopTransaction[]>;
      addShopTransaction: (txn: ShopTransaction) => Promise<ShopTransaction>;
      // Meta
      getMeta: (key: string) => Promise<string | null>;
      setMeta: (key: string, value: string) => Promise<boolean>;
    };
  }
}
export {};

