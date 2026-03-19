"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRecipient, getRecipientRequirements, getRecipients } from "@/lib/api/service";
import { Topbar } from "@/components/shared/topbar";
import { formatDate } from "@/lib/utils";
import { Plus, Users, CheckCircle2, Building2, X } from "lucide-react";
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

  useEffect(() => {
    setFieldValues({});
  }, [countryId, currencyId]);

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
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Recipient
          </button>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-glass p-4 animate-pulse">
                <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No recipients yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Pull the required fields from Busha, then create a payout recipient.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
              Add your first recipient
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="card-glass p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{recipient.name}</p>
                    {recipient.is_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {recipient.bank_name || "Bank account"} · ****{recipient.bank_account_number.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">{recipient.bank_account_name || recipient.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-md">{recipient.currency}</span>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(recipient.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl">Add Recipient</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-secondary rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Country</label>
                  <select
                    value={countryId}
                    onChange={(event) => updateCountry(event.target.value)}
                    className="input-base bg-background"
                  >
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Currency</label>
                  <input value={currencyId} readOnly className="input-base bg-secondary" />
                </div>
              </div>

              <button onClick={() => refetch()} className="btn-secondary">
                Reload Requirements
              </button>

              {isLoadingRequirements ? (
                <div className="card-glass p-4 text-sm text-muted-foreground">Loading Busha recipient fields...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requirements.map((requirement) => (
                    <div key={requirement.name} className={requirement.type === "textarea" ? "md:col-span-2" : ""}>
                      <label className="text-sm font-medium block mb-1.5">
                        {requirement.display_name}
                        {requirement.required ? " *" : ""}
                      </label>
                      {renderField(requirement)}
                      {requirement.description && (
                        <p className="text-xs text-muted-foreground mt-1">{requirement.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg">
                These fields come from Busha for the selected country and currency.
              </p>

              <div className="flex gap-3">
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
      )}
    </div>
  );
}
