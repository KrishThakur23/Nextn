
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/use-customers";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Trash2, DatabaseZap } from "lucide-react";

export default function SettingsPage() {
    const { toast } = useToast();
    const { clearAllData, clearAllTransactions } = useCustomers();

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    }
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast({
                title: "File Uploaded",
                description: `${file.name} has been uploaded successfully.`,
            });
            // In a real app, you would process the file here.
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-headline font-semibold">Settings</h1>
                <p className="text-muted-foreground">Manage your application and data settings.</p>
            </div>

            <Tabs defaultValue="shop">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="shop">Shop Details</TabsTrigger>
                    <TabsTrigger value="data">Data Management</TabsTrigger>
                </TabsList>
                <TabsContent value="shop">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Shop Profile</CardTitle>
                            <CardDescription>Update your business information. This will appear on receipts and reports.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="shop-name">Shop Name</Label>
                                <Input id="shop-name" placeholder="Enter your shop's name" defaultValue="Gauri Khata Jewellers" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="shop-address">Address</Label>
                                <Input id="shop-address" placeholder="Enter your shop's address" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shop-phone">Phone Number</Label>
                                    <Input id="shop-phone" placeholder="Enter phone number" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="shop-gst">GSTIN</Label>
                                    <Input id="shop-gst" placeholder="Enter GST Identification Number" />
                                </div>
                            </div>
                             <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="data">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Data Tools</CardTitle>
                            <CardDescription>Import, export, or clear your application data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">Import Data</h4>
                                    <p className="text-sm text-muted-foreground">Upload a backup file to restore your data.</p>
                                </div>
                                <Button asChild variant="outline">
                                    <label htmlFor="import-file">
                                        <FileUp className="mr-2 h-4 w-4" /> Import File
                                        <input type="file" id="import-file" className="hidden" onChange={handleFileUpload} accept=".json" />
                                    </label>
                                </Button>
                            </div>
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 border rounded-lg border-destructive/50 bg-destructive/5">
                                <div>
                                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                                    <p className="text-sm text-muted-foreground">These actions are irreversible. Please be certain before proceeding.</p>
                                </div>
                                <div className="flex gap-2">
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="destructive" className="w-full sm:w-auto">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Clear Transactions
                                             </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete all transaction history for all customers. Customer profiles will be kept. This action cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={clearAllTransactions}>Yes, Clear Transactions</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                           <Button variant="destructive" className="w-full sm:w-auto">
                                                <DatabaseZap className="mr-2 h-4 w-4" />
                                                Clear Database
                                           </Button>
                                        </AlertDialogTrigger>
                                         <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete all customer and transaction data.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={clearAllData}>Yes, Clear Database</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
