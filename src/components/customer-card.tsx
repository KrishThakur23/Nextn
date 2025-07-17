
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Customer, Transaction, MetalExchangeDetails, SalePurchaseDetails, TunchDetails, GoldCashTransactionDetails } from "@/lib/types";
import { Printer, Gem, Diamond, IndianRupee, ArrowRightLeft, FlaskConical, ShoppingCart, ArrowDownToDot, ArrowUpFromDot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function getTransactionDescription(tx: Transaction): string {
    switch (tx.category) {
        case 'Tunch':
            const tunchDetails = tx.details as TunchDetails;
            return `Purity Check: ${tunchDetails.sampleType} (${tunchDetails.grossWeight}g @ ${tunchDetails.purity}%)`;
        case 'MetalExchange':
            const exchangeDetails = tx.details as MetalExchangeDetails;
            return `Metal Exchange: ${exchangeDetails.samples.length} sample(s), settled as ${exchangeDetails.settlementType}`;
        case 'Sale':
            const saleDetails = tx.details as SalePurchaseDetails;
            return `Sale of ${saleDetails.weight.toFixed(3)}g ${saleDetails.metal} - ${saleDetails.remarks}`;
        case 'Purchase':
            const purchaseDetails = tx.details as SalePurchaseDetails;
            return `Purchase of ${purchaseDetails.weight.toFixed(3)}g ${purchaseDetails.metal} - ${purchaseDetails.remarks}`;
        case 'GoldIn':
        case 'CashIn':
        case 'SilverIn':
            const inDetails = tx.details as GoldCashTransactionDetails;
            return inDetails.remarks || `Received ${tx.category.replace('In', '')}`;
        case 'GoldOut':
        case 'CashOut':
        case 'SilverOut':
             const outDetails = tx.details as GoldCashTransactionDetails;
            return outDetails.remarks || `Paid ${tx.category.replace('Out', '')}`;
        default:
            return `Transaction`;
    }
}

const categoryStyles: Record<Transaction['category'], { icon: React.ReactNode; badgeClass: string; iconClass: string; }> = {
    Tunch: { icon: <FlaskConical/>, badgeClass: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800", iconClass: "text-cyan-500" },
    MetalExchange: { icon: <ArrowRightLeft />, badgeClass: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", iconClass: "text-amber-500" },
    Sale: { icon: <ShoppingCart />, badgeClass: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", iconClass: "text-red-500" },
    Purchase: { icon: <ShoppingCart />, badgeClass: "bg-lime-100 dark:bg-lime-900/50 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800", iconClass: "text-lime-500" },
    CashIn: { icon: <ArrowDownToDot />, badgeClass: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", iconClass: "text-green-500" },
    GoldIn: { icon: <ArrowDownToDot />, badgeClass: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", iconClass: "text-green-500" },
    CashOut: { icon: <ArrowUpFromDot />, badgeClass: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", iconClass: "text-rose-500" },
    GoldOut: { icon: <ArrowUpFromDot />, badgeClass: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", iconClass: "text-rose-500" },
    SilverIn: { icon: <ArrowDownToDot />, badgeClass: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", iconClass: "text-green-500" },
    SilverOut: { icon: <ArrowUpFromDot />, badgeClass: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", iconClass: "text-rose-500" },
};


export function CustomerCard({ customer }: { customer: Customer }) {
  const { toast } = useToast();
  
  const handlePrint = () => {
    window.print();
    toast({
        title: "Print Job Sent",
        description: "Your receipt is being printed.",
    });
  };

  const totalTransactions = customer.transactions.length;

  return (
    <Card className="print-container">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.photo_path} alt={customer.name} />
            <AvatarFallback className="text-2xl">
              {customer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline">{customer.name}</CardTitle>
            <CardDescription className="font-code">{customer.phone}</CardDescription>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" className="no-print">
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </CardHeader>
      <CardContent>
        <h3 className="mb-4 text-lg font-semibold font-headline">Transaction History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Cash Change</TableHead>
              <TableHead className="text-right">Gold Change</TableHead>
              <TableHead className="text-right">Silver Change</TableHead>
              <TableHead className="text-right font-code">Cash Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customer.transactions.map((tx) => {
              const style = categoryStyles[tx.category];
              return (
                <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{getTransactionDescription(tx)}</TableCell>
                    <TableCell>
                    <Badge variant="outline" className={cn("flex items-center gap-1.5", style.badgeClass)}>
                        <div className={cn("h-4 w-4", style.iconClass)}>
                             {style.icon}
                        </div>
                        {tx.category}
                    </Badge>
                    </TableCell>
                    <TableCell className={cn('text-right font-code', tx.cashChange > 0 ? 'text-green-600' : tx.cashChange < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                        {tx.cashChange >= 0 ? '+' : ''}₹{new Intl.NumberFormat('en-IN').format(tx.cashChange)}
                    </TableCell>
                     <TableCell className={cn('text-right font-code', tx.goldChange > 0 ? 'text-green-600' : tx.goldChange < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                        {tx.goldChange > 0 ? '+' : ''}{tx.goldChange.toFixed(3)}g
                    </TableCell>
                    <TableCell className={cn('text-right font-code', tx.silverChange > 0 ? 'text-green-600' : tx.silverChange < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                        {tx.silverChange > 0 ? '+' : ''}{tx.silverChange.toFixed(3)}g
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-code",
                      tx.cashBalanceAfter > 0 && "text-green-600",
                      tx.cashBalanceAfter < 0 && "text-destructive"
                    )}>
                        ₹{new Intl.NumberFormat('en-IN').format(tx.cashBalanceAfter)}
                    </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
      <Separator />
       <CardFooter className="bg-muted/40 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 w-full">
            <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                    <p className="font-bold text-lg font-code">{totalTransactions}</p>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <IndianRupee className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-xs text-muted-foreground">Cash Balance</p>
                    <p className={cn(
                      "font-bold text-lg font-code",
                       customer.cashBalance > 0 && "text-green-600",
                       customer.cashBalance < 0 && "text-destructive"
                    )}>₹{new Intl.NumberFormat('en-IN').format(customer.cashBalance)}</p>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <Gem className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-xs text-muted-foreground">Gold Balance</p>
                    <p className="font-bold text-lg font-code">{customer.goldBalance.toFixed(3)} g</p>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <Diamond className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-xs text-muted-foreground">Silver Balance</p>
                    <p className="font-bold text-lg font-code">{customer.silverBalance.toFixed(3)} g</p>
                </div>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
