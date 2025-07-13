
"use client";

import { TransactionForm } from "@/components/transaction-form";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function BuySellPage() {
    const { customers, liveRates } = useCustomers();
    const { toast } = useToast();
    const router = useRouter();

    const handleSuccess = (customerId: string) => {
        toast({
            title: "Transaction Saved",
            description: "The buy/sell transaction has been recorded.",
        });
        router.push(`/customers/${customerId}`);
    };

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-headline font-semibold">Buy / Sell</h1>
                <p className="text-muted-foreground">Record a new sale or purchase transaction.</p>
            </div>
            <TransactionForm 
                customers={customers}
                liveRates={liveRates}
                onFormSubmit={handleSuccess}
            />
        </div>
    );
}
