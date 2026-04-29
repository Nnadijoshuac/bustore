"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { createRecipient, getRecipientRequirements, getRecipients } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { formatDate } from "@/lib/utils";
import type { CreateRecipientInput, Recipient, RecipientRequirement } from "@/types";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const COUNTRY_OPTIONS = [
  { label: "Nigeria", value: "NG", currency: "NGN" },
  { label: "Ghana", value: "GH", currency: "GHS" },
  { label: "Kenya", value: "KE", currency: "KES" },
  { label: "South Africa", value: "ZA", currency: "ZAR" },
];

export default function RecipientsPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [countryId, setCountryId] = useState("NG");
  const [currencyId, setCurrencyId] = useState("NGN");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: getRecipients,
  });

  const { data: requirements = [], isLoading: isLoadingRequirements, refetch } = useQuery({
    queryKey: ["recipient-requirements", countryId, currencyId],
    queryFn: () => getRecipientRequirements(countryId, currencyId),
    enabled: panelOpen && !selectedRecipient,
  });

  const mutation = useMutation({
    mutationFn: (input: CreateRecipientInput) => createRecipient(input),
    onSuccess: (recipient) => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      toast({ title: "Recipient added", description: recipient.name, variant: "success" });
      setPanelOpen(false);
      setFieldValues({});
    },
    onError: (error) =>
      toast({
        title: "Failed to add recipient",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      }),
  });

  function updateCountry(nextCountryId: string) {
    const option = COUNTRY_OPTIONS.find((item) => item.value === nextCountryId);
    setCountryId(nextCountryId);
    setCurrencyId(option?.currency || "NGN");
    setFieldValues({});
  }

  function handleAdd() {
    setSelectedRecipient(null);
    setPanelOpen(true);
  }

  function handleView(recipient: Recipient) {
    setSelectedRecipient(recipient);
    setPanelOpen(true);
  }

  function renderField(requirement: RecipientRequirement) {
    const commonProps = {
      value: fieldValues[requirement.name] || "",
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFieldValues((current) => ({ ...current, [requirement.name]: event.target.value })),
      className: "input-base h-10 font-bold text-slate-800",
    };

    if (requirement.options?.length) {
      return (
        <select {...commonProps}>
          <option value="">Select option</option>
          {requirement.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return <input {...commonProps} type={requirement.type === "number" ? "number" : "text"} />;
  }

  function handleCreateRecipient() {
    const missingField = requirements.find((item) => item.required && !fieldValues[item.name]?.trim());

    if (missingField) {
      toast({ title: "Required field", description: `${missingField.display_name} is missing.`, variant: "error" });
      return;
    }

    mutation.mutate({
      country_id: countryId,
      currency_id: currencyId,
      type: "bank",
      legal_entity_type: "individual",
      fields: requirements
        .filter((item) => fieldValues[item.name]?.trim())
        .map((item) => ({
          name: item.name,
          value: fieldValues[item.name].trim(),
        })),
    });
  }

  const filteredRecipients = recipients.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.bank_account_number.includes(searchQuery)
  );

  return (
    <div className="relative min-h-screen">
      <Topbar
        title="Payout Accounts"
        description="Saved bank accounts and mobile-money destinations for cash-out"
        actions={
          <button onClick={handleAdd} className="btn-primary py-1.5 h-8">
            <Icon icon="solar:user-plus-bold-duotone" className="w-4 h-4" />
            Add Recipient
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Icon icon="solar:magnifer-bold-duotone" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-8 bg-card border-none shadow-sm h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <Icon icon="solar:bank-bold-duotone" className="w-7 h-7 text-muted-foreground" />
            </div>
              <h3 className="font-display font-bold text-base text-slate-800">No payout accounts added</h3>
                <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">
                  Add a bank account or mobile wallet before you cash out.
                </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecipients.map((recipient) => (
              <div
                key={recipient.id}
                onClick={() => handleView(recipient)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-card p-3 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon icon="solar:bank-bold-duotone" className="w-5 h-5" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs truncate text-slate-800">{recipient.name}</h4>
                    {recipient.is_verified && (
                      <Icon icon="solar:check-circle-bold-duotone" className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {recipient.bank_name || "Bank account"} · ****{recipient.bank_account_number.slice(-4)}
                  </p>
                </div>

                <div className="hidden sm:block text-right px-3">
                   <span className="text-[9px] font-bold uppercase tracking-wider bg-secondary px-1.5 py-0.5 rounded-lg text-slate-700">
                    {recipient.currency}
                  </span>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                    {formatDate(recipient.created_at)}
                  </p>
                </div>

                <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-4 h-4 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Panel Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/10" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-xl bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/50",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {selectedRecipient ? "Recipient Details" : "Add Recipient"}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {selectedRecipient ? `Managing payout for ${selectedRecipient.name}` : "Configure a payout destination"}
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {selectedRecipient ? (
                <div className="space-y-6">
                  <div className="p-5 rounded-[1.5rem] bg-secondary/30 flex items-center gap-4 border border-border/40">
                     <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                       <Icon icon="solar:bank-bold-duotone" className="w-7 h-7 text-primary" />
                     </div>
                     <div>
                       <h3 className="font-bold text-base text-slate-800">{selectedRecipient.name}</h3>
                       <p className="text-xs text-muted-foreground font-medium">{selectedRecipient.bank_name}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Account Number</p>
                      <div className="text-xs font-mono font-bold bg-secondary/50 p-3 rounded-xl border border-border/30 text-slate-800 tracking-wider">
                        {selectedRecipient.bank_account_number}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1 p-3 rounded-xl bg-secondary/30 border border-border/20">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Currency</p>
                        <p className="text-xs font-bold text-slate-800">{selectedRecipient.currency}</p>
                      </div>
                      <div className="space-y-1 p-3 rounded-xl bg-secondary/30 border border-border/20">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Status</p>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            selectedRecipient.is_verified ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                          <p className="text-xs font-bold text-slate-800">{selectedRecipient.is_verified ? "Verified" : "Pending"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 flex items-start gap-3 border border-primary/10">
                    <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                      This payout account is active. Cash-outs sent here usually reflect within 15-30 minutes during business hours.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Network Selection</h6>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Country</label>
                        <select 
                          value={countryId} 
                          onChange={(e) => updateCountry(e.target.value)} 
                          className="input-base bg-background h-10 font-bold text-slate-800"
                        >
                          {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Currency</label>
                        <input value={currencyId} readOnly className="input-base bg-secondary/50 text-muted-foreground h-10 font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between px-1">
                       <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Account Details</h6>
                       <button onClick={() => refetch()} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                         <Icon icon="solar:restart-bold-duotone" className={cn("w-3 h-3", isLoadingRequirements && "animate-spin")} />
                         Refresh Fields
                       </button>
                    </div>

                    {isLoadingRequirements ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-secondary/50 rounded-xl animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {requirements.map((req) => (
                          <div key={req.name} className={cn(req.type === "textarea" && "md:col-span-2")}>
                            <label className="text-xs font-bold block mb-1 text-slate-700">
                              {req.display_name} {req.required && <span className="text-red-500">*</span>}
                            </label>
                            {renderField(req)}
                            {req.description && <p className="text-[9px] text-muted-foreground mt-1 font-medium italic opacity-70">{req.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 flex items-start gap-3 border border-border/30">
                    <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                      Data requirements are pulled dynamically from Busha for the selected country to ensure settlement finality.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-slate-50/50">
              <div className="flex gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setPanelOpen(false)}
                  className="h-10 flex-1 rounded-xl border border-border bg-white px-4 text-xs font-bold"
                >
                  {selectedRecipient ? "Close" : "Cancel"}
                </button>
                {!selectedRecipient && (
                  <button 
                    onClick={handleCreateRecipient}
                    disabled={mutation.isPending || requirements.length === 0}
                    className="flex-[1.5] btn-primary justify-center h-10"
                  >
                    <Icon icon="solar:check-read-bold-duotone" className="w-4 h-4" />
                    {mutation.isPending ? "Adding..." : "Add Recipient"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
