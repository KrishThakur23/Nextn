
"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";

// --- Electron Customers & Transactions Hook ---
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

type CustomerTransaction = {
  id?: number;
  customer_id: number;
  timestamp: string;
  category: string;
  details: any;
  cashBalanceAfter?: number;
  cashChange?: number;
  goldBalanceAfter?: number;
  goldChange?: number;
  silverBalanceAfter?: number;
  silverChange?: number;
};

function useElectronCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchCustomers = async () => {
    setLoading(true);
    if (window.api?.getCustomers) {
      const data = await window.api.getCustomers();
      setCustomers(data);
    }
    setLoading(false);
  };
  const addCustomer = async (customer: Customer) => {
    if (window.api?.addCustomer) {
      await window.api.addCustomer(customer);
      fetchCustomers();
    }
  };
  useEffect(() => { fetchCustomers(); }, []);
  return { customers, loading, addCustomer, fetchCustomers };
}

function useCustomerTransactions(customerId: number | undefined) {
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchTxns = async () => {
    if (!customerId) return;
    setLoading(true);
    if (window.api?.getCustomerTransactions) {
      const data = await window.api.getCustomerTransactions(customerId);
      setTransactions(data);
    }
    setLoading(false);
  };
  const addTransaction = async (txn: CustomerTransaction) => {
    if (window.api?.addCustomerTransaction) {
      await window.api.addCustomerTransaction(txn);
      fetchTxns();
    }
  };
  useEffect(() => { fetchTxns(); }, [customerId]);
  return { transactions, loading, addTransaction, fetchTxns };
}
// --- END Electron Customers & Transactions Hook ---



import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, RefreshCw, IndianRupee, Diamond, Scale, Gem, BookUser, ArrowRightLeft, ShoppingCart, Info, Milestone, Tag, Loader2, BarChart3, ArrowDown, ArrowUp } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction} from "@/lib/types";
import { addDays, eachDayOfInterval, format, startOfDay, endOfDay } from 'date-fns';
import { cn } from "@/lib/utils";


function getTransactionValue(tx: Transaction): number {
    switch (tx.category) {
        case 'Sale':
        case 'Purchase':
            return (tx.details as any).totalAmount;
        case 'MetalExchange':
            return Math.abs((tx.details as any).finalAmount);
        case 'Tunch':
            return (tx.details as any).tunchCharges;
        case 'CashIn':
        case 'CashOut':
             return (tx.details as any).amount;
        default:
            return 0;
    }
}


function Dashboard() {
  const { customers, shopTransactions, liveRates, updateLiveRates } = useCustomers();
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const { toast } = useToast();
  
  const allCustomerTransactions = useMemo(() => customers.flatMap(c => c.transactions), [customers]);
  
  const balanceMetrics = useMemo(() => {
    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const to = dateRange?.to ? endOfDay(dateRange.to) : undefined;

    let openingGold = 0;
    let openingSilver = 0;
    let openingCash = 0;

    let netChangeGold = 0;
    let netChangeSilver = 0;
    let netChangeCash = 0;

    allCustomerTransactions.forEach(tx => {
        const txDate = new Date(tx.timestamp);
        
        if (from && to && txDate >= from && txDate <= to) {
            netChangeGold += tx.goldChange;
            netChangeSilver += tx.silverChange;
            netChangeCash += tx.cashChange;
        } else if (!from && !to) { // Default case if no date range
            netChangeGold += tx.goldChange;
            netChangeSilver += tx.silverChange;
            netChangeCash += tx.cashChange;
        }
    });

    if (from) {
        const txsBeforeDate = allCustomerTransactions
            .filter(tx => new Date(tx.timestamp) < from)
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const openingBalances = customers.map(customer => {
            const lastTxBefore = [...customer.transactions].filter(tx => new Date(tx.timestamp) < from).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            return {
                gold: lastTxBefore ? lastTxBefore.goldBalanceAfter : 0,
                silver: lastTxBefore ? lastTxBefore.silverBalanceAfter : 0,
                cash: lastTxBefore ? lastTxBefore.cashBalanceAfter : 0,
            }
        });

        openingGold = openingBalances.reduce((sum, b) => sum + b.gold, 0);
        openingSilver = openingBalances.reduce((sum, b) => sum + b.silver, 0);
        openingCash = openingBalances.reduce((sum, b) => sum + b.cash, 0);

    } else {
        openingGold = 0;
        openingSilver = 0;
        openingCash = 0;
    }


    return {
        gold: {
            opening: openingGold,
            net: netChangeGold,
            closing: openingGold + netChangeGold,
        },
        silver: {
            opening: openingSilver,
            net: netChangeSilver,
            closing: openingSilver + netChangeSilver,
        },
        cash: {
            opening: openingCash,
            net: netChangeCash,
            closing: openingCash + netChangeCash,
        }
    }

  }, [allCustomerTransactions, dateRange, customers]);


  const chartData = useMemo(() => {
    const allTransactions = [
      ...customers.flatMap(c => c.transactions),
      ...shopTransactions,
    ];

    const start = dateRange?.from ? startOfDay(dateRange.from) : addDays(startOfDay(new Date()), -6);
    const end = dateRange?.to ? startOfDay(dateRange.to) : startOfDay(new Date());

    const days = eachDayOfInterval({ start, end });
    const dataByDay: { [key: string]: number } = {};
    days.forEach(day => {
        dataByDay[format(day, 'MMM d')] = 0;
    });

    allTransactions.forEach(tx => {
        const txDate = startOfDay(new Date(tx.timestamp));
        if (txDate >= start && txDate <= end) {
            const dayKey = format(txDate, 'MMM d');
            dataByDay[dayKey] = (dataByDay[dayKey] || 0) + getTransactionValue(tx as Transaction);
        }
    });
    
    return Object.keys(dataByDay).map(day => ({
      name: day,
      total: dataByDay[day]
    }));
  }, [customers, shopTransactions, dateRange]);

  const chartConfig = {
    total: {
      label: "Total Transaction Value",
      color: "hsl(var(--primary))",
    },
  } satisfies import("@/components/ui/chart").ChartConfig;
  
  const chartDescription = dateRange?.from && dateRange.to 
    ? `Showing transactions from ${format(dateRange.from, 'LLL d')} to ${format(dateRange.to, 'LLL d')}.`
    : "Showing transactions for the last 7 days.";


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-headline font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">An overview of your business activities.</p>
        </div>
        <DatePickerWithRange value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Gold Balance" icon={<Gem />} opening={balanceMetrics.gold.opening} closing={balanceMetrics.gold.closing} net={balanceMetrics.gold.net} unit="g" />
        <StatCard title="Silver Balance" icon={<Diamond />} opening={balanceMetrics.silver.opening} closing={balanceMetrics.silver.closing} net={balanceMetrics.silver.net} unit="g" />
        <StatCard title="Cash Balance" icon={<IndianRupee />} opening={balanceMetrics.cash.opening} closing={balanceMetrics.cash.closing} net={balanceMetrics.cash.net} unit="₹" isCurrency/>
      </div>
      
      <div className="grid grid-cols-1">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Transaction Analytics</CardTitle>
                    <CardDescription>{chartDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                           <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value as number)}`}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    formatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(value as number)}`}
                                    indicator="dot" 
                                />}
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
    return (
        <div className="flex justify-center items-center h-full min-h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
        </Suspense>
    )
}
