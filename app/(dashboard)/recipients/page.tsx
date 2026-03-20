"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Plus, Users, X } from "lucide-react";
import { createRecipient, getRecipientRequirements, getRecipients } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { formatDate } from "@/lib/utils";
import type { CreateRecipientInput, Recipient, RecipientRequirement } from "@/types";
import { useToast } from "@/components/ui/toaster";

const COUNTRY_OPTIONS = [
  { label: "Nigeria", value: "NG", currency: "NGN" },
  { label: "Ghana", value: "GH", currency: "GHS" },
  { label: "Kenya", value: "KE", currency: "KES" },
  { label: "South Africa", value: "ZA", currency: "ZAR" },
];

export default function RecipientsPage() {
  const [showModal, setShowModal] = useState(false);
  const [countryId, setCountryId] = useState("NG");
  const [currencyId, setCurrencyId] = useState("NGN");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: getRecipients,
  });

  const { data: requirements = [], isLoading: isLoadingRequirements, refetch } = useQuery({
    queryKey: ["recipient-requirements", countryId, currencyId],
    queryFn: () => getRecipientRequirements(countryId, currencyId),
    enabled: showModal,
  });

  const mutation = useMutation({
    mutationFn: (input: CreateRecipientInput) => createRecipient(input),
    onSuccess: (recipient) => {
      queryClient.setQueryData<Recipient[]>(["recipients"], (current = []) => [
        recipient,
        ...current.filter((item) => item.id !== recipient.id),
      ]);
      toast({ title: "Recipient created", description: recipient.name, variant: "success" });
      setShowModal(false);
      setFieldValues({});
    },
    onError: (error) =>
      toast({
        title: "Failed to create recipient",
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

  function renderField(requirement: RecipientRequirement) {
    const commonProps = {
      value: fieldValues[requirement.name] || "",
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFieldValues((current) => ({ ...current, [requirement.name]: event.target.value })),
      className: "input-base",
    };

    if (requirement.options?.length) {
      return (
        <select {...commonProps}>
          <option value="">Select</option>
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
      toast({
        title: "Missing field",
        description: `${missingField.display_name} is required.`,
        variant: "error",
      });
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

  return (
    <div>
      <Topbar
        title="Recipients"
        description="Create settlement recipients from Busha's live field requirements"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary w-full justify-center sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Recipient
          </button>
        }
      />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card-glass animate-pulse p-4">
                <div className="mb-2 h-4 w-1/3 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 font-semibold">No recipients yet</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Pull the required fields from Busha, then create a payout recipient.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
              Add your first recipient
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="card-glass p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{recipient.name}</p>
                      {recipient.is_verified ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {recipient.bank_name || "Bank account"} · ****{recipient.bank_account_number.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">{recipient.bank_account_name || recipient.name}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{recipient.currency}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(recipient.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 pt-6 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-4 shadow-xl animate-slide-in sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Add Recipient</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Country</label>
                  <select value={countryId} onChange={(event) => updateCountry(event.target.value)} className="input-base bg-background">
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Currency</label>
                  <input value={currencyId} readOnly className="input-base bg-secondary" />
                </div>
              </div>

              <button onClick={() => refetch()} className="btn-secondary">
                Reload Requirements
              </button>

              {isLoadingRequirements ? (
                <div className="card-glass p-4 text-sm text-muted-foreground">Loading Busha recipient fields...</div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {requirements.map((requirement) => (
                    <div key={requirement.name} className={requirement.type === "textarea" ? "md:col-span-2" : ""}>
                      <label className="mb-1.5 block text-sm font-medium">
                        {requirement.display_name}
                        {requirement.required ? " *" : ""}
                      </label>
                      {renderField(requirement)}
                      {requirement.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{requirement.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                These fields come from Busha for the selected country and currency.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleCreateRecipient}
                  disabled={mutation.isPending || requirements.length === 0}
                  className="btn-primary flex-1 justify-center"
                >
                  {mutation.isPending ? "Saving..." : "Save Recipient"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
