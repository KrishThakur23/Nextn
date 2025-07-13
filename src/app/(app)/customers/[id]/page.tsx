
"use client";

import { CustomerCard } from "@/components/customer-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from 'next/navigation';
import { useCustomers } from "@/hooks/use-customers";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";
import type { Customer } from "@/lib/types";

export default function CustomerDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idParam);
  const { getCustomer, customers, liveRates } = useCustomers();
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  // The customer object from the hook can change, so we need to keep our local state in sync.
  useEffect(() => {
    setCustomer(getCustomer(id));
  }, [id, getCustomer, customers]);


  if (!id) {
    return notFound();
  }
  
  if (customer === undefined) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!customer) {
    notFound();
  }
  
  const onFormSubmit = () => {
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center no-print">
        <Button asChild variant="outline">
            <Link href="/customers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
            </Link>
        </Button>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">New Transaction</DialogTitle>
                    <DialogDescription>Add a new transaction for {customer.name}.</DialogDescription>
                </DialogHeader>
                <TransactionForm customers={[customer]} liveRates={liveRates} onFormSubmit={onFormSubmit} />
            </DialogContent>
         </Dialog>
      </div>
      <CustomerCard customer={customer} />
    </div>
  );
}
