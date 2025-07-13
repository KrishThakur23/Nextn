
"use client"

import Link from "next/link";
import {
  Users,
  Settings,
  Store,
  Repeat,
  Trash2,
  FlaskConical,
  ArrowUpDown,
  ShoppingCart,
  AreaChart,
  BookUser,
  PanelLeft,
  Briefcase,
  PlusCircle,
  Gem,
  UserCircle,
  LayoutDashboard
} from "lucide-react";
import * as React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { CustomerProvider, useCustomers } from "@/hooks/use-customers";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-primary"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <h1 className="text-xl font-bold font-headline text-primary">Gauri Khata</h1>
    </div>
  );
}

function MainNav() {
    const pathname = usePathname();
    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        // Make sure /customers doesn't activate for /customers/[id]
        if (path === '/customers') return pathname === '/customers';
        return pathname.startsWith(path);
    };

    const navItems = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/buy-sell', icon: ShoppingCart, label: 'Sale / Purchase' },
        { href: '/exchange', icon: Repeat, label: 'Metal Exchange' },
        { href: '/in-out', icon: ArrowUpDown, label: 'Gold/Cash In-Out' },
        { href: '/tunch', icon: FlaskConical, label: 'Tunch' },
        { href: '/customers', icon: Users, label: 'Customers' },
        { href: '/reports', icon: AreaChart, label: 'Reports' },
    ];
    
    return (
         <nav className="grid gap-2">
            {navItems.map((item) => (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                        <Button
                            asChild
                            variant={isActive(item.href) ? 'default' : 'ghost'}
                            size="lg"
                            className="justify-start gap-4"
                        >
                            <Link href={item.href} className="flex items-center">
                                <item.icon className="h-5 w-5" />
                                <span className="text-base">{item.label}</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            ))}
        </nav>
    );
}

function MobileNav() {
     const pathname = usePathname();
    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };
    
    const navItems = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/buy-sell', icon: ShoppingCart, label: 'Sale / Purchase' },
        { href: '/exchange', icon: Repeat, label: 'Metal Exchange' },
        { href: '/in-out', icon: ArrowUpDown, label: 'Gold/Cash In-Out' },
        { href: '/tunch', icon: FlaskConical, label: 'Tunch' },
        { href: '/customers', icon: Users, label: 'Customers' },
        { href: '/reports', icon: AreaChart, label: 'Reports' },
    ];
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-4 text-lg font-medium">
                    <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                        <Gem className="h-5 w-5 transition-all group-hover:scale-110" />
                        <span className="sr-only">Gauri Khata</span>
                    </div>
                     {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-2.5",
                                isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
}

function Header() {
    const { clearAllData } = useCustomers();
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <div className="ml-auto flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <UserCircle className="h-6 w-6" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Clear Database</span>
                            </DropdownMenuItem>
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
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 items-center border-b px-6">
                   <Logo />
                </div>
                 <div className="flex-1 overflow-auto py-2">
                    <MainNav />
                 </div>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-72">
                 <Header />
                <main className="flex-1 p-4 sm:px-6 sm:py-0">
                    {children}
                </main>
            </div>
        </div>
    </TooltipProvider>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <MainLayout>{children}</MainLayout>
    </CustomerProvider>
  );
}
