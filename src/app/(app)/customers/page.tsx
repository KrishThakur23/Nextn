
"use client";

import { useState } from "react";
import { CustomerForm } from "@/components/customer-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, MoreVertical, Trash2, Edit, BookOpen, Users } from "lucide-react";
import { exportToExcel } from "@/lib/excel";
import type { Customer } from "@/lib/types";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const { customers, deleteCustomer } = useCustomers();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const dataToExport = customers.map((customer: Customer) => {
      const currentBalance = customer.cashBalance;
      return {
        Name: customer.name,
        Phone: customer.phone,
        "Cash Balance": `₹${new Intl.NumberFormat('en-IN').format(currentBalance)}`,
        "Gold Balance (g)": customer.goldBalance,
        "Silver Balance (g)": customer.silverBalance,
      };
    });
    exportToExcel(dataToExport, "Customer_Balances", "Customer Balances");
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };
  
  const handleDelete = (customerId: string) => {
    deleteCustomer(Number(customerId));
    toast({
        title: "Customer Deleted",
        description: "The customer has been removed successfully.",
    });
  }

  const onFormSubmit = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-headline font-semibold">Customers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={customers.length === 0}>
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle className="font-headline">
                  New Customer Profile
                </DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new customer.
                </DialogDescription>
              </DialogHeader>
              <CustomerForm onFormSubmit={onFormSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
        {customers.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Cash Balance</TableHead>
                  <TableHead className="text-right">Gold Balance</TableHead>
                  <TableHead className="text-right">Silver Balance</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const currentBalance = customer.cashBalance;
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.photo_path} alt={customer.name} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-muted-foreground text-sm">{customer.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-code",
                        currentBalance > 0 && "text-green-600",
                        currentBalance < 0 && "text-destructive"
                      )}>
                        ₹{new Intl.NumberFormat('en-IN').format(currentBalance)}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-code",
                        customer.goldBalance > 0 && "text-green-600",
                        customer.goldBalance < 0 && "text-destructive"
                      )}>
                        {customer.goldBalance.toFixed(2)} g
                      </TableCell>
                      <TableCell className="text-right font-code">{customer.silverBalance.toFixed(2)} g</TableCell>
                      <TableCell>
                        <Dialog open={editDialogOpen && editingCustomer?.id === customer.id} onOpenChange={setEditDialogOpen}>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>View Kundli</span>
                                </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Customer</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Customer</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the customer and all their associated data.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(String(customer.id))}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                             <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                    <DialogTitle className="font-headline">Edit Customer Profile</DialogTitle>
                                    <DialogDescription>Update the details for {editingCustomer?.name}.</DialogDescription>
                                </DialogHeader>
                                <CustomerForm customer={editingCustomer} onFormSubmit={onFormSubmit} />
                            </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center border rounded-lg p-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Customers Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first customer.</p>
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="mt-6">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle className="font-headline">
                      New Customer Profile
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new customer.
                    </DialogDescription>
                  </DialogHeader>
                  <CustomerForm onFormSubmit={onFormSubmit} />
                </DialogContent>
              </Dialog>
        </div>
      )}
    </div>
  );
}
