
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Save, Repeat, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
    customerId: z.string().nonempty("Customer is required."),
    sampleType: z.string().min(2, "Type is required."),
    grossWeight: z.coerce.number().positive("Must be > 0"),
    purity: z.coerce.number().min(0).max(100, "Must be 0-100"),
    tunchCharges: z.coerce.number().min(0).default(0),
    remarks: z.string().optional(),
    imageUrl: z.string().optional(),
});

type TunchFormValues = z.infer<typeof formSchema>;

interface TunchFormProps {
    customers: Customer[];
    onSaveTunch: (data: any) => void;
    onCreateExchange: (data: any) => void;
}

export function TunchForm({ customers, onSaveTunch, onCreateExchange }: TunchFormProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [openCustomerSelector, setOpenCustomerSelector] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm<TunchFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerId: "",
            sampleType: "Ornament",
            grossWeight: 0,
            purity: 0,
            tunchCharges: 0,
            remarks: "",
        },
    });

    const watchGrossWeight = form.watch("grossWeight");
    const watchPurity = form.watch("purity");

    const fineWeight = useMemo(() => {
        return (watchGrossWeight || 0) * ((watchPurity || 0) / 100);
    }, [watchGrossWeight, watchPurity]);
    
    const otherWeight = useMemo(() => {
        return (watchGrossWeight || 0) - fineWeight;
    }, [watchGrossWeight, fineWeight]);

    useEffect(() => {
        if (selectedCustomer) {
            form.setValue("customerId", String(selectedCustomer.id));
        }
    }, [selectedCustomer, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPreview(dataUrl);
                form.setValue("imageUrl", dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const onSubmit = (values: TunchFormValues) => {
        const finalData = {
            ...values,
            customer: selectedCustomer,
            fineWeight,
        };
        onSaveTunch(finalData);
        form.reset();
        setPreview(null);
        setSelectedCustomer(null);
    };

    const handleExchangeClick = () => {
        const values = form.getValues();
         const finalData = {
            ...values,
            customer: selectedCustomer,
            fineWeight,
        };
        onCreateExchange(finalData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Tunch Details</CardTitle>
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
                                                                    form.setValue("customerId", String(customer.id));
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <FormField
                                control={form.control}
                                name={`sampleType`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sample Type</FormLabel>
                                        <FormControl><Input placeholder="e.g., Ornament, Old Ring" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`grossWeight`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gross Wt. (gm)</FormLabel>
                                        <FormControl><Input type="number" step="0.001" placeholder="0.000" {...field} /></FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`purity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purity / Tunch (%)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tunchCharges"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tunch Charges</FormLabel>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormItem>
                                <FormLabel className="text-muted-foreground">Fine Wt. (gm)</FormLabel>
                                <Input disabled value={fineWeight.toFixed(3)} />
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-muted-foreground">Other Metal Wt. (gm)</FormLabel>
                                <Input disabled value={otherWeight.toFixed(3)} />
                            </FormItem>
                             <FormItem className="flex flex-col gap-2 md:col-span-2">
                                <FormLabel>Sample Image (Optional)</FormLabel>
                                <div className="flex items-center gap-4">
                                     <div className="w-20 h-20 rounded-lg border-dashed border-2 flex items-center justify-center bg-muted/50 overflow-hidden">
                                        {preview ? (
                                            <Image src={preview} alt="preview" width={80} height={80} className="object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
                                                <Upload className="w-6 h-6" />
                                                <span>Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <FormControl>
                                            <Input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFileChange} />
                                        </FormControl>
                                        <Button asChild variant="outline">
                                            <label htmlFor="image-upload">Choose File</label>
                                        </Button>
                                    </div>
                                </div>
                             </FormItem>
                        </div>
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl><Textarea placeholder="Optional notes about the sample..." {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={handleExchangeClick} disabled={!form.formState.isValid}>
                            <Repeat className="mr-2 h-4 w-4" />
                            Create Metal Exchange
                        </Button>
                         <Button type="submit" size="lg" disabled={!form.formState.isValid}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Tunch Entry
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
