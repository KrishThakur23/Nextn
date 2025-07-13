
"use client";

import { TunchForm } from "@/components/tunch-form";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function TunchPage() {
    const { customers, addTransaction } = useCustomers();
    const { toast } = useToast();
    const router = useRouter();

    const handleSaveTunch = (data: any) => {
        if (data.customer) {
            addTransaction(data.customer.id, {
                category: 'Tunch',
                details: {
                    sampleType: data.sampleType,
                    grossWeight: data.grossWeight,
                    purity: data.purity,
                    fineWeight: data.fineWeight,
                    tunchCharges: data.tunchCharges,
                    imageUrl: data.imageUrl,
                    remarks: data.remarks,
                }
            });
            toast({
                title: "Tunch Entry Saved",
                description: "The purity check has been recorded successfully.",
            });
        }
    };
    
    const handleCreateExchange = (data: any) => {
        // Here you would typically pass the data to the exchange page
        // For now, we'll just navigate and the user can re-enter the data.
        // A more advanced implementation would use query params or state management.
        toast({
            title: "Redirecting to Metal Exchange",
            description: "Please re-enter sample details for the exchange.",
        });
        router.push('/exchange');
    };

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-headline font-semibold">Tunch (Purity Check)</h1>
                <p className="text-muted-foreground">Create a new purity check entry for a customer.</p>
            </div>
            <TunchForm 
                customers={customers} 
                onSaveTunch={handleSaveTunch}
                onCreateExchange={handleCreateExchange}
            />
        </div>
    );
}
