
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format."),
  pan: z.string().optional(),
  notes: z.string().optional(),
  photo: z.any().optional(),
  aadhaarFront: z.any().optional(),
  aadhaarBack: z.any().optional(),
});

type CustomerFormProps = {
    customer?: Customer | null;
    onFormSubmit?: () => void;
}

function ImageUploadField({ field, label, defaultUrl }: { field: any, label: string, defaultUrl?: string }) {
    const [preview, setPreview] = useState<string | null>(defaultUrl || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                field.onChange(dataUrl);
                setPreview(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    
    useEffect(() => {
        if (defaultUrl) {
            setPreview(defaultUrl);
        }
    }, [defaultUrl]);

    return (
        <FormItem className="flex flex-col items-center gap-2">
          <FormLabel>{label}</FormLabel>
            <div className="w-32 h-32 rounded-lg border-dashed border-2 flex items-center justify-center bg-muted/50 overflow-hidden">
                {preview ? (
                    <Image src={preview} alt="preview" width={128} height={128} className="object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-8 h-8" />
                        <span className="text-xs">Upload</span>
                    </div>
                )}
            </div>
          <FormControl>
            <Input type="file" accept="image/*" className="hidden" id={field.name} onChange={handleFileChange} />
          </FormControl>
          <Button asChild variant="outline" size="sm">
            <label htmlFor={field.name}>Choose File</label>
          </Button>
          <FormMessage />
        </FormItem>
    );
}

export function CustomerForm({ customer, onFormSubmit }: CustomerFormProps) {
  const { toast } = useToast();
  const { addCustomer, updateCustomer } = useCustomers();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      pan: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (customer) {
        form.reset({
            name: customer.name,
            phone: customer.phone,
            pan: customer.pan || '',
            notes: customer.notes || '',
        });
    } else {
        form.reset({
            name: "",
            phone: "",
            pan: "",
            notes: "",
        });
    }
  }, [customer, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    
    const customerData = {
      name: values.name,
      phone: values.phone,
      pan: values.pan,
      notes: values.notes,
      photo_path: typeof values.photo === 'string' ? values.photo : customer?.photo_path,
      adhar_front_path: typeof values.aadhaarFront === 'string' ? values.aadhaarFront : customer?.adhar_front_path,
      adhar_back_path: typeof values.aadhaarBack === 'string' ? values.aadhaarBack : customer?.adhar_back_path
    };

    if (customer) {
        updateCustomer(customer.id, customerData);
        toast({
            title: "Customer Updated",
            description: `${values.name}'s details have been updated.`,
        });
    } else {
        addCustomer(customerData);
        toast({
            title: "Customer Created",
            description: `${values.name} has been added to your customer list.`,
        });
    }
    
    if(onFormSubmit) {
      onFormSubmit();
    }
    
    if (!customer) {
        form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => <ImageUploadField field={field} label="Photo" defaultUrl={customer?.photo_path} />}
            />
            <FormField
              control={form.control}
              name="aadhaarFront"
              render={({ field }) => <ImageUploadField field={field} label="Aadhaar Front" defaultUrl={customer?.adhar_front_path} />}
            />
            <FormField
              control={form.control}
              name="aadhaarBack"
              render={({ field }) => <ImageUploadField field={field} label="Aadhaar Back" defaultUrl={customer?.adhar_back_path} />}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter customer's full name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="+91 12345 67890" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="pan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PAN Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="ABCDE1234F" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Details / Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional information..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{customer ? 'Update Customer' : 'Save Customer'}</Button>
      </form>
    </Form>
  );
}
