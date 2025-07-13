
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Customer, LiveRates } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronsUpDown, PlusCircle, Trash2, Image as ImageIcon, ChevronsRightLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const sampleSchema = z.object({
    id: z.string(),
    type: z.enum(["ornament", "kacha", "coin", "custom"]),
    grossWeight: z.coerce.number().positive("Must be > 0"),
    purity: z.coerce.number().min(0).max(100, "Must be 0-100"),
    imageUrl: z.string().optional(),
});

const formSchema = z.object({
    customerId: z.string().nonempty("Customer is required."),
    samples: z.array(sampleSchema).min(1, "At least one sample is required."),
    metalReturned: z.coerce.number().min(0).default(0),
    rate: z.coerce.number().positive("Rate must be positive"),
    tonCharges: z.coerce.number().min(0).default(0),
    settlementType: z.enum(["on-the-spot", "jama", "bakaya"]),
    remarks: z.string().optional(),
});

type MetalExchangeFormValues = z.infer<typeof formSchema>;

interface MetalExchangeFormProps {
    customers: Customer[];
    liveRates: LiveRates;
    onTransactionSave: (data: any) => void;
}

function SummaryLine({ label, value, className }: { label: string, value: string | number, className?: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <p className="text-muted-foreground">{label}</p>
            <p className={cn("font-medium font-code", className)}>{value}</p>
        </div>
    );
}


export function MetalExchangeForm({ customers, liveRates, onTransactionSave }: MetalExchangeFormProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [openCustomerSelector, setOpenCustomerSelector] = useState(false);

    const form = useForm<MetalExchangeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerId: "",
            samples: [],
            metalReturned: 0,
            rate: liveRates.gold.sell,
            tonCharges: 0,
            settlementType: "on-the-spot",
            remarks: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "samples",
    });

    const watchSamples = form.watch("samples");
    const watchMetalReturned = form.watch("metalReturned");
    const watchTonCharges = form.watch("tonCharges");
    const watchRate = form.watch("rate");

    const calculations = useMemo(() => {
        const totalGrossWeight = watchSamples.reduce((acc, s) => acc + (parseFloat(String(s.grossWeight)) || 0), 0);
        const totalFineWeight = watchSamples.reduce((acc, s) => {
            const fine = (parseFloat(String(s.grossWeight)) || 0) * ((parseFloat(String(s.purity)) || 0) / 100);
            return acc + fine;
        }, 0);
        const metalReturned = parseFloat(String(watchMetalReturned)) || 0;
        const tonCharges = parseFloat(String(watchTonCharges)) || 0;
        const rate = parseFloat(String(watchRate)) || 0;
        
        const metalDifference = totalFineWeight - metalReturned;
        const valueOfDifference = metalDifference * rate;
        const finalAmount = valueOfDifference - tonCharges;

        const previousBalance = selectedCustomer?.cashBalance ?? 0;
        const grandTotal = finalAmount + previousBalance;

        return { totalGrossWeight, totalFineWeight, metalDifference, valueOfDifference, finalAmount, previousBalance, grandTotal };
    }, [watchSamples, watchMetalReturned, watchTonCharges, watchRate, selectedCustomer]);


    useEffect(() => {
        if (selectedCustomer) {
            form.setValue("customerId", selectedCustomer.id);
        } else {
            form.setValue("customerId", "");
        }
    }, [selectedCustomer, form]);
    
    useEffect(() => {
        form.setValue("rate", liveRates.gold.sell);
    }, [liveRates.gold.sell, form]);
    
    const onSubmit = (values: MetalExchangeFormValues) => {
        const finalData = {
            ...values,
            customer: selectedCustomer,
            settlement: {
                totalGrossWeight: calculations.totalGrossWeight,
                totalFineWeight: calculations.totalFineWeight,
                metalDifference: calculations.metalDifference,
                valueOfDifference: calculations.valueOfDifference,
                tonCharges: values.tonCharges,
                finalAmount: calculations.finalAmount,
            },
            rateUsed: values.rate,
        };
        onTransactionSave(finalData);
        form.reset({
            customerId: "",
            samples: [],
            metalReturned: 0,
            rate: liveRates.gold.sell,
            tonCharges: 0,
            settlementType: "on-the-spot",
            remarks: "",
        });
        setSelectedCustomer(null);
    };
    
    const addNewSample = () => {
        append({
            id: `sample-${Date.now()}`,
            type: "ornament",
            grossWeight: 0,
            purity: 0,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Customer & Transaction</CardTitle>
                                <CardDescription>Select a customer and set transaction details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                                        <CommandInput placeholder="Search customer by name or phone..." />
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
                                <FormField
                                    control={form.control}
                                    name="rate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gold Rate (per gm)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="font-headline">Metal Samples</CardTitle>
                                    <CardDescription>Add customer's old gold samples for exchange.</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addNewSample}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Sample
                                </Button>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {fields.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-8">No samples added yet.</p>
                                )}
                                {fields.map((field, index) => (
                                    <Collapsible key={field.id} defaultOpen className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <CollapsibleTrigger asChild>
                                                <div className="flex items-center gap-2 cursor-pointer">
                                                    <ChevronsRightLeft className="h-4 w-4 text-muted-foreground" />
                                                    <p className="font-medium">
                                                        Sample #{index + 1}
                                                            <span className="text-muted-foreground font-normal ml-2">({watchSamples[index]?.type || 'N/A'})</span>
                                                    </p>
                                                </div>
                                            </CollapsibleTrigger>
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CollapsibleContent className="space-y-4 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`samples.${index}.type`}
                                                    render={({ field: selectField }) => (
                                                        <FormItem>
                                                            <FormLabel>Sample Type</FormLabel>
                                                            <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="ornament">Ornament</SelectItem>
                                                                    <SelectItem value="kacha">Kacha (Raw)</SelectItem>
                                                                    <SelectItem value="coin">Coin</SelectItem>
                                                                    <SelectItem value="custom">Custom</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`samples.${index}.grossWeight`}
                                                    render={({ field: inputField }) => (
                                                        <FormItem>
                                                            <FormLabel>Gross Wt. (gm)</FormLabel>
                                                            <FormControl><Input type="number" step="0.001" placeholder="0.000" {...inputField} /></FormControl>
                                                                <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`samples.${index}.purity`}
                                                    render={({ field: inputField }) => (
                                                        <FormItem>
                                                            <FormLabel>Purity (%)</FormLabel>
                                                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...inputField} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                                <div>
                                                    <FormLabel className="text-muted-foreground text-xs">Fine Wt. (gm)</FormLabel>
                                                    <Input disabled value={((form.watch(`samples.${index}.grossWeight`) || 0) * (form.watch(`samples.${index}.purity`) || 0) / 100).toFixed(3)} />
                                                </div>
                                                 {(form.watch(`samples.${index}.purity`) < 50 || form.watch(`samples.${index}.purity`) > 99.99) && form.watch(`samples.${index}.purity`) !== 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <p>Purity is unusual. Please double-check.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6 sticky top-6">
                        <Card>
                            <CardHeader><CardTitle className="font-headline">Settlement</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
                                    <SummaryLine label="Total Gross Weight" value={`${calculations.totalGrossWeight.toFixed(3)} gm`} />
                                    <SummaryLine label="Total Fine Weight" value={`${calculations.totalFineWeight.toFixed(3)} gm`} className="text-primary"/>
                                </div>
                                <Separator/>
                                <FormField
                                    control={form.control}
                                    name="metalReturned"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fine Metal Returned (gm)</FormLabel>
                                            <FormControl><Input type="number" step="0.001" placeholder="0.000" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Separator/>
                                <div className="space-y-2">
                                    <SummaryLine label="Metal Difference" value={`${calculations.metalDifference.toFixed(3)} gm`} />
                                    <SummaryLine label="Value of Difference" value={`₹${new Intl.NumberFormat('en-IN').format(calculations.valueOfDifference)}`} />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="tonCharges"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ton Charges (₹)</FormLabel>
                                            <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Separator/>
                                <div className="flex justify-between items-center text-lg">
                                    <p className="font-semibold">{calculations.finalAmount >= 0 ? 'Net Amount to Receive' : 'Net Amount to Pay'}</p>
                                    <p className={cn("font-bold font-code", calculations.finalAmount >= 0 ? "text-green-600" : "text-destructive" )}>
                                        ₹{new Intl.NumberFormat('en-IN').format(Math.abs(calculations.finalAmount))}
                                    </p>
                                </div>
                                {selectedCustomer && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                                            <SummaryLine 
                                                label="Previous Balance" 
                                                value={`₹${new Intl.NumberFormat('en-IN').format(calculations.previousBalance)}`}
                                                className={calculations.previousBalance < 0 ? "text-destructive" : ""}
                                            />
                                            <div className="flex justify-between items-center text-xl">
                                                <p className="font-bold font-headline text-base">{calculations.grandTotal >= 0 ? 'Final Amt. to Receive' : 'Final Amt. Due'}</p>
                                                <p className={cn("font-bold font-code", calculations.grandTotal >= 0 ? "text-green-600" : "text-destructive" )}>
                                                    ₹{new Intl.NumberFormat('en-IN').format(Math.abs(calculations.grandTotal))}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <FormField
                                    control={form.control}
                                    name="settlementType"
                                    render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Settlement Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="on-the-spot">On-the-spot</SelectItem>
                                                    <SelectItem value="jama">Jama (Advance)</SelectItem>
                                                    <SelectItem value="bakaya">Bakaya (Due)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="remarks"
                                    render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl><Textarea placeholder="Optional notes..." {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                             <CardFooter>
                                <Button type="submit" className="w-full" size="lg" disabled={!form.formState.isValid}>Save Transaction</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
