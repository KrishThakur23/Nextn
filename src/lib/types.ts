export type Customer = {
  id?: number;
  name: string;
  phone: string;
  pan?: string;
  notes?: string;
  photo_path?: string;
  adhar_front_path?: string;
  adhar_back_path?: string;
  
  cashBalance: number; // in Rupees
  goldBalance: number; // in grams (Fine Weight)
  silverBalance: number; // in grams (Fine Weight)

  transactions: Transaction[];
};

export type TransactionCategory = 'Tunch' | 'MetalExchange' | 'Sale' | 'Purchase' | 'GoldIn' | 'GoldOut' | 'CashIn' | 'CashOut' | 'SilverIn' | 'SilverOut';

export type TransactionPayload = {
    category: TransactionCategory;
    details: TunchDetails | MetalExchangeDetails | SalePurchaseDetails | GoldCashTransactionDetails;
}

export type Transaction = {
  id: number;
  timestamp: string; // ISO 8601 format
  category: TransactionCategory;
  details: TunchDetails | MetalExchangeDetails | SalePurchaseDetails | GoldCashTransactionDetails;
  
  cashChange: number;
  goldChange: number;
  silverChange: number;

  // Running balances after this transaction
  cashBalanceAfter: number;
  goldBalanceAfter: number;
  silverBalanceAfter: number;
};

// Represents a transaction not tied to a specific customer (e.g., shop rent)
export type ShopTransaction = {
    id: string;
    timestamp: string;
    category: 'CashIn' | 'CashOut';
    details: GoldCashTransactionDetails;
}


// Details for Tunch (Purity Check)
export type TunchDetails = {
  sampleType: string;
  grossWeight: number;
  purity: number;
  fineWeight: number;
  tunchCharges: number;
  imageUrl?: string;
  remarks?: string;
};

// Details for Metal Exchange
export type MetalExchangeSample = {
  id: string;
  type: 'ornament' | 'kacha' | 'coin' | 'custom';
  grossWeight: number;
  purity: number;
  imageUrl?: string;
};

export type MetalExchangeDetails = {
    samples: MetalExchangeSample[];
    totalGrossWeight: number;
    totalFineWeight: number;
    metalReturned: number; // Fine metal returned to customer
    metalDifference: number; // From shop's perspective: +ve is fine gold IN, -ve is fine gold OUT.
    rateUsed: number; // Rate for valuing the difference
    valueOfDifference: number;
    tonCharges: number;
    finalAmount: number; // From shop's perspective: +ve is cash IN, -ve is cash OUT.
    settlementType: 'on-the-spot' | 'jama' | 'bakaya';
    remarks?: string;
};

// Details for Sale/Purchase
export type SalePurchaseDetails = {
    type: 'Sale' | 'Purchase'; // From shop's perspective
    metal: 'gold' | 'silver';
    weight: number; // Fine weight
    rate: number;
    totalAmount: number;
    amountPaid: number;
    remarks?: string;
};

// Details for simple Gold/Cash In/Out
export type GoldCashTransactionDetails = {
    type: 'GoldIn' | 'GoldOut' | 'CashIn' | 'CashOut' | 'SilverIn' | 'SilverOut';
    amount: number; // Can be grams for gold/silver or currency for cash
    remarks?: string;
    rate?: number; // Rate used for metal transactions
    cashValue?: number; // Corresponding cash value for metal transactions
}

export type LiveRates = {
  gold: { buy: number; sell: number };
  silver: { buy: number; sell: number };
};
