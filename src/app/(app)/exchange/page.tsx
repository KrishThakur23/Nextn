
"use client";

import { MetalExchangeForm } from "@/components/metal-exchange-form";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";

export default function MetalExchangePage() {
    const { customers, addTransaction, liveRates } = useCustomers();
    const { toast } = useToast();

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-headline font-semibold">Metal Exchange (Palta)</h1>
                <p className="text-muted-foreground">Create a new metal exchange transaction.</p>
            </div>
            <MetalExchangeForm 
                customers={customers} 
                liveRates={liveRates} 
                onTransactionSave={(data) => {
                    if (data.customer) {
                        addTransaction(data.customer.id, {
                           category: 'MetalExchange',
                           details: {
                                samples: data.samples,
                                totalGrossWeight: data.settlement.totalGrossWeight,
                                totalFineWeight: data.settlement.totalFineWeight,
                                metalReturned: data.metalReturned,
                                metalDifference: data.settlement.metalDifference,
                                rateUsed: data.rateUsed,
                                valueOfDifference: data.settlement.valueOfDifference,
                                tonCharges: data.tonCharges,
                                finalAmount: data.settlement.finalAmount,
                                settlementType: data.settlementType,
                                remarks: data.remarks,
                           }
                        });
                        toast({
                            title: "Transaction Saved",
                            description: "The metal exchange has been recorded successfully.",
                        });
                    }
                }}
            />
        </div>
    );
}
