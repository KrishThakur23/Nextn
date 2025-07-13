
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import type { SalePurchaseDetails, Customer, LiveRates } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

const formSchema = z.object({
  customerId: z.string().nonempty("Customer is required."),
  description: z.string().min(2, "Description must be at least 2 characters."),
  type: z.enum(["Sale", "Purchase"]),
  metal: z.enum(["gold", "silver"]),
  weight: z.coerce.number().positive("Weight must be positive"),
  rate: z.coerce.number().positive("Rate must be positive"),
  amountPaid: z.coerce.number().min(0, "Cannot be negative"),
});

type TransactionFormProps = {
    customers: Customer[];
    liveRates: LiveRates;
    onFormSubmit?: (customerId: string) => void;
}

export function TransactionForm({ customers, liveRates, onFormSubmit }: TransactionFormProps) {
  const { addTransaction } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openCustomerSelector, setOpenCustomerSelector] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      description: "",
      type: "Sale",
      metal: "gold",
      weight: 0,
      rate: 0,
      amountPaid: 0,
    },
  });

  const watchType = form.watch("type");
  const watchMetal = form.watch("metal");

  useEffect(() => {
    if (liveRates) {
        const rateType = watchType === 'Sale' ? 'sell' : 'buy';
        const newRate = liveRates[watchMetal][rateType];
        form.setValue("rate", newRate, { shouldValidate: true });
    }
  }, [watchType, watchMetal, liveRates, form]);

  useEffect(() => {
    if (customers.length === 1) {
        setSelectedCustomer(customers[0]);
    }
  }, [customers]);

  useEffect(() => {
    if (selectedCustomer) {
        form.setValue("customerId", selectedCustomer.id);
    }
  }, [selectedCustomer, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const totalAmount = values.weight * values.rate;

    addTransaction(values.customerId, {
        category: values.type,
        details: {
            type: values.type,
            metal: values.metal,
            weight: values.weight,
            rate: values.rate,
            totalAmount: totalAmount,
            amountPaid: values.amountPaid,
            remarks: values.description,
        } as SalePurchaseDetails
    });
    
    if (onFormSubmit) {
      onFormSubmit(values.customerId);
    }
    
    form.reset({
      customerId: "",
      description: "",
      type: "Sale",
      metal: "gold",
      weight: 0,
      rate: liveRates.gold.sell,
      amountPaid: 0,
    });
    setSelectedCustomer(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">New Buy/Sell Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transaction Type</FormLabel>
                                <ToggleGroup 
                                    type="single"
                                    variant="outline"
                                    value={field.value}
                                    onValueChange={(value: "Sale" | "Purchase") => value && field.onChange(value)}
                                    className="justify-start"
                                >
                                    <ToggleGroupItem value="Sale" className="w-24 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Sale</ToggleGroupItem>
                                    <ToggleGroupItem value="Purchase" className="w-24 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Purchase</ToggleGroupItem>
                                </ToggleGroup>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="metal"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Metal</FormLabel>
                             <ToggleGroup 
                                type="single"
                                variant="outline"
                                value={field.value}
                                onValueChange={(value: "gold" | "silver") => value && field.onChange(value)}
                                className="justify-start"
                            >
                                <ToggleGroupItem value="gold" className="rounded-full w-10 h-10 data-[state=on]:bg-amber-400 data-[state=on]:text-amber-900">G</ToggleGroupItem>
                                <ToggleGroupItem value="silver" className="rounded-full w-10 h-10 data-[state=on]:bg-slate-400 data-[state=on]:text-slate-900">S</ToggleGroupItem>
                            </ToggleGroup>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description / Remarks</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Gold Ring 22k, Silver Anklet" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Weight (g)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.001" placeholder="0.000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Rate (per g)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amountPaid"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Amount Paid (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" size="lg" disabled={!form.formState.isValid}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Transaction
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
