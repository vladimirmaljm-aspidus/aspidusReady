"use client";
import * as React from "react";
import { Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BankAccount {
  bankName?: string;
  bank_name?: string;
  currency?: string;
  swiftCode?: string;
  swift_code?: string;
  accountNumber?: string;
  account_number?: string;
}

interface BankAccountSelectorProps {
  /** The tenant's bank_accounts array (from tenant.bank_accounts) */
  accounts: BankAccount[] | string | null;
  /** Selected indexes (e.g., [0, 2] = first and third account) */
  selected: number[] | null;
  onChange: (selected: number[] | null) => void;
  className?: string;
}

export function BankAccountSelector({ accounts, selected, onChange, className }: BankAccountSelectorProps) {
  const [open, setOpen] = React.useState(false);

  // Parse accounts (can be array, JSON string, or null)
  const accountList: BankAccount[] = React.useMemo(() => {
    if (!accounts) return [];
    if (Array.isArray(accounts)) return accounts;
    if (typeof accounts === "string") {
      try { return JSON.parse(accounts); } catch { return []; }
    }
    return [];
  }, [accounts]);

  if (accountList.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 border rounded">
        No bank accounts configured. Add bank accounts in the tenant settings.
      </div>
    );
  }

  const isSelected = (idx: number) => selected?.includes(idx) ?? false;

  const toggle = (idx: number) => {
    const current = selected || [];
    const next = current.includes(idx)
      ? current.filter(i => i !== idx)
      : [...current, idx];
    onChange(next.length === 0 ? null : next);
  };

  const selectedCount = selected?.length ?? 0;
  const label = selectedCount === 0
    ? "All accounts"
    : `${selectedCount} account${selectedCount !== 1 ? "s" : ""} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", className)}>
          <span className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            {label}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <ScrollArea className="max-h-64">
          <div className="p-2 space-y-1">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              Select which bank accounts to show in PDF
            </div>
            {accountList.map((acct, idx) => {
              const bankName = acct.bankName || acct.bank_name || "Bank";
              const currency = acct.currency || "";
              const accountNumber = acct.accountNumber || acct.account_number || "—";
              const swift = acct.swiftCode || acct.swift_code || "—";
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-muted/50"
                  onClick={() => toggle(idx)}
                >
                  <Checkbox checked={isSelected(idx)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{bankName}</span>
                      {currency && <Badge variant="secondary" className="text-xs">{currency}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Account: {accountNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SWIFT: {swift}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="border-t p-2 flex justify-between">
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>Show all</Button>
          <Button size="sm" variant="ghost" onClick={() => onChange([])}>Show none</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
