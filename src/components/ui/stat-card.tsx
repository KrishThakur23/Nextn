
"use client";

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Separator } from "./separator";

interface StatCardProps {
    title: string;
    icon: React.ReactNode;
    opening: number;
    closing: number;
    net: number;
    unit: string;
    isCurrency?: boolean;
}

export function StatCard({ title, icon, opening, closing, net, unit, isCurrency = false }: StatCardProps) {
    const formatValue = (value: number, showUnit = true) => {
        const formattedNumber = isCurrency
            ? `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
            : `${value.toFixed(3)}`;
        return showUnit && !isCurrency ? `${formattedNumber} ${unit}` : formattedNumber;
    };
    
    let netChangeIcon;
    let netChangeColor = "text-muted-foreground";

    if (net > 0) {
        netChangeIcon = <ArrowUp className="h-4 w-4" />;
        netChangeColor = "text-green-600";
    } else if (net < 0) {
        netChangeIcon = <ArrowDown className="h-4 w-4" />;
        netChangeColor = "text-destructive";
    } else {
        netChangeIcon = <Minus className="h-4 w-4" />;
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <span className="text-primary">{icon}</span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Opening</span>
                    <span className="font-code font-medium">{formatValue(opening)}</span>
                </div>
                
                <div className={cn("flex justify-between items-baseline font-medium", netChangeColor)}>
                    <span className="text-sm flex items-center gap-1.5">
                        {netChangeIcon}
                        Net Change
                    </span>
                    <span className="font-code">
                        {net > 0 ? '+' : ''}{formatValue(net)}
                    </span>
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                     <span className="text-sm text-muted-foreground">Closing</span>
                     <span className="text-2xl font-bold font-code text-primary">
                        {formatValue(closing, false)}
                        {!isCurrency && <span className="text-lg ml-1 text-muted-foreground">{unit}</span>}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
