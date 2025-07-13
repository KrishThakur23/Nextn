
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/use-customers";
import type { GoldCashTransactionDetails, Customer, LiveRates } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Save, User, Store, ArrowDown, ArrowUp, Gem, Diamond, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";


const formSchema = z.object({
  transactionFor: z.enum(["customer", "shop"]),
  customerId: z.string().optional(),
  type: z.enum(["GoldIn", "GoldOut", "CashIn", "CashOut", "SilverIn", "SilverOut"]),
  amount: z.coerce.number().positive("Amount/Weight must be positive"),
  rate: z.coerce.number().optional(),
  remarks: z.string().optional(),
}).refine(data => {
    if (data.transactionFor === 'customer') {
        return !!data.customerId;
    }
    return true;
}, {
    message: "Customer is required.",
    path: ["customerId"],
});

type InOutFormProps = {
    customers: Customer[];
    liveRates: LiveRates;
    onFormSubmit?: (customerId?: string) => void;
}

export function InOutForm({ customers, liveRates, onFormSubmit }: InOutFormProps) {
  const { addTransaction } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openCustomerSelector, setOpenCustomerSelector] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionFor: "customer",
      type: "CashIn",
      amount: 0,
      remarks: "",
      rate: 0,
    },
  });

  useEffect(() => {
    if (selectedCustomer) {
        form.setValue("customerId", selectedCustomer.id);
    }
  }, [selectedCustomer, form]);

  const watchTransactionFor = form.watch("transactionFor");
  const watchType = form.watch("type");
  
  const isGold = watchType === 'GoldIn' || watchType === 'GoldOut';
  const isSilver = watchType === 'SilverIn' || watchType === 'SilverOut';
  const isCash = watchType === 'CashIn' || watchType === 'CashOut';

  const defaultRate = isGold 
    ? (watchType === 'GoldIn' ? liveRates.gold.buy : liveRates.gold.sell)
    : isSilver
    ? (watchType === 'SilverIn' ? liveRates.silver.buy : liveRates.silver.sell)
    : 0;
  
  useEffect(() => {
    if (isGold || isSilver) {
        form.setValue("rate", defaultRate);
    } else {
        form.setValue("rate", 0);
    }
  }, [watchType, isGold, isSilver, defaultRate, form]);

  const handleTransactionForChange = (value: 'customer' | 'shop') => {
      if (!value) return;
      form.setValue('transactionFor', value);
      if (value === 'shop') {
          form.setValue('customerId', undefined);
          setSelectedCustomer(null);
          form.setValue('type', 'CashIn');
      } else {
          form.setValue('type', 'CashIn');
      }
  }

  const handleTypeChange = (value: "GoldIn" | "GoldOut" | "CashIn" | "CashOut" | "SilverIn" | "SilverOut") => {
      if (!value) return;
      form.setValue('type', value);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    
    let cashValue = 0;
    const rateUsed = values.rate || 0;
    if ((isGold || isSilver) && rateUsed > 0) {
        cashValue = values.amount * rateUsed;
    }

    addTransaction(values.customerId, {
        category: values.type,
        details: {
            type: values.type,
            amount: values.amount,
            remarks: values.remarks,
            rate: rateUsed,
            cashValue: cashValue,
        } as GoldCashTransactionDetails
    });
    onFormSubmit?.(values.customerId);
    
    form.reset({
      transactionFor: "customer",
      customerId: undefined,
      type: "CashIn",
      amount: 0,
      remarks: "",
      rate: 0
    });
    setSelectedCustomer(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">New In/Out Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="transactionFor"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Transaction For</FormLabel>
                        <ToggleGroup type="single" value={field.value} onValueChange={handleTransactionForChange} className="grid grid-cols-2 gap-2">
                           <ToggleGroupItem value="customer" aria-label="For customer" className="flex flex-col h-auto py-3 gap-2">
                                <User className="h-6 w-6" />
                                <span>Customer</span>
                           </ToggleGroupItem>
                           <ToggleGroupItem value="shop" aria-label="For shop" className="flex flex-col h-auto py-3 gap-2">
                                <Store className="h-6 w-6" />
                                <span>Shop Expense/Income</span>
                           </ToggleGroupItem>
                        </ToggleGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchTransactionFor === 'customer' && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                      <FormLabel>Transaction Type</FormLabel>
                      <ToggleGroup type="single" value={field.value} onValueChange={handleTypeChange} className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <ToggleGroupItem value="CashIn" aria-label="Cash In" className="flex flex-col h-auto py-3 gap-2">
                              <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5" /><ArrowDown className="h-5 w-5 text-green-500"/></div>
                              <span>Cash In</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="CashOut" aria-label="Cash Out" className="flex flex-col h-auto py-3 gap-2">
                               <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5" /><ArrowUp className="h-5 w-5 text-red-500"/></div>
                              <span>Cash Out</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="GoldIn" aria-label="Gold In" className="flex flex-col h-auto py-3 gap-2">
                               <div className="flex items-center gap-2"><Gem className="h-5 w-5" /><ArrowDown className="h-5 w-5 text-green-500"/></div>
                              <span>Gold In</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="GoldOut" aria-label="Gold Out" className="flex flex-col h-auto py-3 gap-2">
                               <div className="flex items-center gap-2"><Gem className="h-5 w-5" /><ArrowUp className="h-5 w-5 text-red-500"/></div>
                              <span>Gold Out</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="SilverIn" aria-label="Silver In" className="flex flex-col h-auto py-3 gap-2">
                               <div className="flex items-center gap-2"><Diamond className="h-5 w-5" /><ArrowDown className="h-5 w-5 text-green-500"/></div>
                              <span>Silver In</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="SilverOut" aria-label="Silver Out" className="flex flex-col h-auto py-3 gap-2">
                               <div className="flex items-center gap-2"><Diamond className="h-5 w-5" /><ArrowUp className="h-5 w-5 text-red-500"/></div>
                              <span>Silver Out</span>
                          </ToggleGroupItem>
                      </ToggleGroup>
                      <FormMessage/>
                      </FormItem>
                    )}
                  />
                )}
                 {watchTransactionFor === 'shop' && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                      <FormLabel>Transaction Type</FormLabel>
                      <ToggleGroup type="single" value={field.value} onValueChange={handleTypeChange} className="grid grid-cols-2 gap-2">
                          <ToggleGroupItem value="CashIn" aria-label="Cash In" className="flex flex-col h-auto py-3 gap-2">
                              <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5" /><ArrowDown className="h-5 w-5 text-green-500"/></div>
                              <span>Cash Income</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="CashOut" aria-label="Cash Out" className="flex flex-col h-auto py-3 gap-2">
                               <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5" /><ArrowUp className="h-5 w-5 text-red-500"/></div>
                              <span>Cash Expense</span>
                          </ToggleGroupItem>
                      </ToggleGroup>
                      <FormMessage/>
                      </FormItem>
                    )}
                  />
                )}

                {watchTransactionFor === 'customer' && (
                  <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                              <FormLabel>Select Customer</FormLabel>
                              <Popover open={openCustomerSelector} onOpenChange={setOpenCustomerSelector}>
                                  <PopoverTrigger asChild>
                                      <FormControl>
                                          <Button
                                              variant="outline"
                                              role="combobox"
                                              className={cn("w-full md:w-1/2 justify-between", !field.value && "text-muted-foreground")}
                                          >
                                              {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : "Select customer..."}
                                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                      </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                      <Command>
                                          <CommandInput placeholder="Search customer..." />
                                          <CommandList>
                                              <CommandEmpty>No customer found.</CommandEmpty>
                                              <CommandGroup>
                                                  {customers.map((customer) => (
                                                      <CommandItem
                                                          value={`${customer.name} ${customer.phone} ${customer.id}`}
                                                          key={customer.id}
                                                          onSelect={() => {
                                                              setSelectedCustomer(customer);
                                                              form.setValue("customerId", customer.id);
                                                              setOpenCustomerSelector(false);
                                                          }}
                                                      >
                                                          {customer.name} ({customer.phone})
                                                      </CommandItem>
                                                  ))}
                                              </CommandGroup>
                                          </CommandList>
                                      </Command>
                                  </PopoverContent>
                              </Popover>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{isGold || isSilver ? 'Weight (g)' : 'Amount (₹)'}</FormLabel>
                            <FormControl>
                                <Input type="number" step={isCash ? "0.01" : "0.001"} placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {(isGold || isSilver) && (
                        <FormField
                            control={form.control}
                            name="rate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rate (per g)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
                 <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Optional notes about the transaction..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={!form.formState.isValid}>
                    <Save className="mr-2 h-4 w-4"/>
                    Save Transaction
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
