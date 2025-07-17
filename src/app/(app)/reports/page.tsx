
"use client";

import { useCustomers } from "@/hooks/use-customers";
import type { Customer, ShopTransaction, Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, TrendingDown, Users, Receipt, List } from "lucide-react";

const calculateBusinessVolume = (customer: Customer): number => {
  return customer.transactions.reduce((total, tx) => {
    switch (tx.category) {
      case 'Sale':
      case 'Purchase':
        // Only SalePurchaseDetails have totalAmount
        return total + (typeof tx.details === 'object' && 'totalAmount' in tx.details ? tx.details.totalAmount : 0);
      case 'MetalExchange':
        // Only MetalExchangeDetails have valueOfDifference
        return total + (typeof tx.details === 'object' && 'valueOfDifference' in tx.details ? Math.abs(tx.details.valueOfDifference) : 0);
      case 'Tunch':
        // Only TunchDetails have tunchCharges
        return total + (typeof tx.details === 'object' && 'tunchCharges' in tx.details ? tx.details.tunchCharges : 0);
      default:
        return total;
    }
  }, 0);
};
// Market Dues Component
const MarketDues = ({ customers }: { customers: Customer[] }) => {
  const customersWithDues = customers.filter(c => c.cashBalance < 0);
  const totalDues = customersWithDues.reduce((acc, c) => acc + c.cashBalance, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Dues</CardTitle>
        <CardDescription>List of all customers with outstanding balances.</CardDescription>
      </CardHeader>
      <CardContent>
        {customersWithDues.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Due Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersWithDues.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={c.photo_path} alt={c.name} />
                            <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-muted-foreground text-sm">{c.phone}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-code text-destructive">
                    {`₹${new Intl.NumberFormat('en-IN').format(Math.abs(c.cashBalance))}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
             <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Total Dues</TableCell>
                    <TableCell className="text-right font-bold font-code text-destructive">
                         {`₹${new Intl.NumberFormat('en-IN').format(Math.abs(totalDues))}`}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Dues</h3>
            <p className="mt-1 text-sm text-muted-foreground">All customer accounts are clear.</p>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

// Expense Report Component
const ExpenseReport = ({ shopTransactions }: { shopTransactions: ShopTransaction[] }) => {
    const expenseData = shopTransactions
        .filter(tx => tx.category === 'CashOut')
        .reduce((acc, tx) => {
            // A simple categorization based on remarks for demo purposes
            const category = tx.details.remarks?.split(' ')[0].toLowerCase() || 'general';
            const existing = acc.find(item => item.name === category);
            if (existing) {
                existing.value += tx.details.amount;
            } else {
                acc.push({ name: category, value: tx.details.amount });
            }
            return acc;
        }, [] as { name: string; value: number }[]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Expense Report</CardTitle>
                <CardDescription>A breakdown of shop expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
                {expenseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                        <Receipt className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Expense Data</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Record shop expenses to see a report here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


// Premium Customers Component
const PremiumCustomers = ({ customers }: { customers: Customer[] }) => {
  const rankedCustomers = customers
    .map(c => ({
      ...c,
      businessVolume: calculateBusinessVolume(c),
    }))
    .filter(c => c.businessVolume > 0)
    .sort((a, b) => b.businessVolume - a.businessVolume)
    .slice(0, 10); // Top 10

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Customers</CardTitle>
        <CardDescription>Top customers ranked by total business volume.</CardDescription>
      </CardHeader>
      <CardContent>
        {rankedCustomers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Business Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedCustomers.map((c, index) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge variant={index < 3 ? "default" : "secondary"} className="text-lg">
                      {index < 3 && <Crown className="mr-2 h-4 w-4" />}
                      {index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={c.photo_path} alt={c.name} />
                            <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-muted-foreground text-sm">{c.phone}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-code">
                    {`₹${new Intl.NumberFormat('en-IN').format(c.businessVolume)}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Customer Data</h3>
                <p className="mt-1 text-sm text-muted-foreground">Perform transactions to rank customers.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

// All Transactions Component
const AllTransactions = ({ customers, shopTransactions }: { customers: Customer[], shopTransactions: ShopTransaction[] }) => {
    const allTxs = [
        ...customers.flatMap(c => c.transactions.map(tx => ({ ...tx, customerName: c.name }))),
        ...shopTransactions.map(tx => ({...tx, customerName: 'Shop Account'}))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>A complete log of all recorded transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                 {allTxs.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount / Weight</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {allTxs.map((tx, idx) => {
                          // Shop transaction (CashIn/CashOut)
                          if (
                            (tx.category === 'CashIn' || tx.category === 'CashOut') &&
                            // Shop tx: id is string, missing cashChange/goldChange, but has details.amount
                            typeof tx.id === 'string'
                          ) {
                            return (
                              <TableRow key={tx.id + '-' + idx}>
                                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{tx.customerName}</TableCell>
                                <TableCell><Badge variant="outline">{tx.category}</Badge></TableCell>
                                <TableCell className="text-right font-code">
                                  {'amount' in tx.details ? `₹${new Intl.NumberFormat('en-IN').format(tx.details.amount)}` : ''}
                                </TableCell>
                              </TableRow>
                            );
                          }

                          // Customer transaction
                          // Safe to assert Transaction & { customerName: string }
                          if (typeof tx.id === 'number' &&
                            'cashChange' in tx &&
                            'goldChange' in tx &&
                            'silverChange' in tx) {
                          return (
                            <TableRow key={tx.id + '-' + idx}>
                              <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{tx.customerName}</TableCell>
                              <TableCell><Badge variant="outline">{tx.category}</Badge></TableCell>
                              <TableCell className="text-right font-code">
                                {tx.cashChange ? `₹${new Intl.NumberFormat('en-IN').format(tx.cashChange)}` : ''}
                                {tx.goldChange ? `${tx.goldChange.toFixed(3)}g Au` : ''}
                                {tx.silverChange ? `${tx.silverChange.toFixed(3)}g Ag` : ''}
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return null;
                        })}
                        </TableBody>
                    </Table>
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                        <List className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Transactions Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Start by adding a transaction for a customer or the shop.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}

export default function ReportsPage() {
  const { customers, shopTransactions } = useCustomers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-headline font-semibold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Analyze your business performance and customer data.</p>
      </div>

      <Tabs defaultValue="dues">
        <TabsList className="grid w-full grid-cols-2 md:w-[600px] md:grid-cols-4">
          <TabsTrigger value="dues">Market Dues</TabsTrigger>
          <TabsTrigger value="expenses">Expense Report</TabsTrigger>
          <TabsTrigger value="premium">Premium Customers</TabsTrigger>
          <TabsTrigger value="all_txs">All Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="dues">
          <MarketDues customers={customers} />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseReport shopTransactions={shopTransactions} />
        </TabsContent>
        <TabsContent value="premium">
          <PremiumCustomers customers={customers} />
        </TabsContent>
        <TabsContent value="all_txs">
            <AllTransactions customers={customers} shopTransactions={shopTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

    