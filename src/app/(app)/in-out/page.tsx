
"use client";

import { InOutForm } from "@/components/in-out-form";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function InOutPage() {
    const { customers, liveRates } = useCustomers();
    const { toast } = useToast();
    const router = useRouter();

    const handleSuccess = (customerId?: string) => {
        toast({
            title: "Transaction Saved",
            description: "The transaction has been recorded successfully.",
        });
        if (customerId) {
            router.push(`/customers/${customerId}`);
        }
    };

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-headline font-semibold">Gold, Silver & Cash In/Out</h1>
                <p className="text-muted-foreground">Record a payment or receipt of metal or cash.</p>
            </div>
            <InOutForm
                customers={customers}
                liveRates={liveRates}
                onFormSubmit={handleSuccess}
            />
        </div>
    );
}
