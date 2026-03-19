"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, ShieldCheck, UserRound, X } from "lucide-react";
import { Topbar } from "@/components/shared/topbar";
import { useToast } from "@/components/ui/toaster";
import { createCustomerBaseSchema, type CreateCustomerInput } from "@/lib/validations/index";
import { createCustomer, getCustomers, verifyCustomer } from "@/lib/api/service";
import type { Customer, CustomerIdentifyingInformation } from "@/types";
import { formatDate } from "@/lib/utils";

function buildIdentifyingInformation(input: CustomerFormValues): CustomerIdentifyingInformation[] | undefined {
  if (!input.document_type || !input.document_front_base64 || !input.selfie_base64) {
    return undefined;
  }

  const document: CustomerIdentifyingInformation = {
    type: input.document_type,
    number: input.document_number,
    country: input.country_id,
    image_front: input.document_front_base64,
    image_back: input.document_type === "national-id" ? input.document_back_base64 : undefined,
  };

  const selfie: CustomerIdentifyingInformation = {
    type: "selfie",
    country: input.country_id,
    number: "",
    image_front: input.selfie_base64,
  };

  return [document, selfie];
}

type CustomerFormValues = CreateCustomerInput & {
  document_type?: "passport" | "national-id";
  document_number?: string;
  document_front_base64?: string;
  document_back_base64?: string;
  selfie_base64?: string;
};

export default function CustomersPage() {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(createCustomerBaseSchema.omit({ identifying_information: true })),
    defaultValues: {
      has_accepted_terms: true,
      type: "individual",
      country_id: "NG",
      address: {
        city: "Lagos",
        state: "Lagos",
        country_id: "NG",
        address_line_1: "",
        postal_code: "",
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) =>
      createCustomer({
        email: values.email,
        has_accepted_terms: values.has_accepted_terms,
        type: "individual",
        country_id: values.country_id,
        phone: values.phone,
        birth_date: values.birth_date,
        first_name: values.first_name,
        middle_name: values.middle_name,
        last_name: values.last_name,
        address: {
          ...values.address,
          country_id: values.country_id,
        },
        identifying_information: buildIdentifyingInformation(values),
      }),
    onSuccess: (customer) => {
      queryClient.setQueryData<Customer[]>(["customers"], (current = []) => [
        customer,
        ...current.filter((item) => item.id !== customer.id),
      ]);
      toast({ title: "Customer created", description: customer.email, variant: "success" });
      reset();
      setShowModal(false);
    },
    onError: (error) =>
      toast({
        title: "Failed to create customer",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyCustomer,
    onSuccess: (customer) => {
      queryClient.setQueryData<Customer[]>(["customers"], (current = []) =>
        current.map((item) => (item.id === customer.id ? customer : item))
      );
      toast({
        title: "Verification submitted",
        description: `${customer.first_name} ${customer.last_name}`,
        variant: "success",
      });
    },
    onError: (error) =>
      toast({
        title: "Failed to verify customer",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      }),
  });

  const selectedDocumentType = useWatch({
    control,
    name: "document_type",
  });

  return (
    <div>
      <Topbar
        title="Customers"
        description="Create and verify individual Busha customers"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Customer
          </button>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card-glass p-4 animate-pulse">
                <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <UserRound className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No customers yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create an individual customer profile and submit KYC directly to Busha.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
              Create your first customer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="card-glass p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <UserRound className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {customer.first_name} {customer.last_name}
                    </p>
                    {customer.status === "active" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-md capitalize">
                    {customer.status.replace("_", " ")}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(customer.created_at)}</p>
                  {customer.status === "inactive" && (
                    <button
                      onClick={() => verifyMutation.mutate(customer.id)}
                      disabled={verifyMutation.isPending}
                      className="btn-secondary mt-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Verify
                    </button>
                  )}
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
              <h2 className="font-display font-bold text-xl">Create Individual Customer</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-secondary rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">First Name *</label>
                  <input {...register("first_name")} className="input-base" />
                  {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Last Name *</label>
                  <input {...register("last_name")} className="input-base" />
                  {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Middle Name</label>
                  <input {...register("middle_name")} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Email *</label>
                  <input {...register("email")} type="email" className="input-base" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Phone *</label>
                  <input {...register("phone")} placeholder="+234 8012345678" className="input-base" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Birth Date *</label>
                  <input {...register("birth_date")} placeholder="24-12-2000" className="input-base" />
                  {errors.birth_date && <p className="text-xs text-red-500 mt-1">{errors.birth_date.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Country *</label>
                  <input {...register("country_id")} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Postal Code *</label>
                  <input {...register("address.postal_code")} className="input-base" />
                  {errors.address?.postal_code && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.postal_code.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">City *</label>
                  <input {...register("address.city")} className="input-base" />
                  {errors.address?.city && <p className="text-xs text-red-500 mt-1">{errors.address.city.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">State *</label>
                  <input {...register("address.state")} className="input-base" />
                  {errors.address?.state && <p className="text-xs text-red-500 mt-1">{errors.address.state.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-1.5">Address Line 1 *</label>
                  <input {...register("address.address_line_1")} className="input-base" />
                  {errors.address?.address_line_1 && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.address_line_1.message}</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-medium">Optional KYC Upload</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Document Type</label>
                    <select {...register("document_type")} className="input-base bg-background">
                      <option value="">No document</option>
                      <option value="passport">Passport</option>
                      <option value="national-id">National ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Document Number</label>
                    <input {...register("document_number")} className="input-base" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium block mb-1.5">Document Front Base64</label>
                    <textarea {...register("document_front_base64")} rows={3} className="input-base resize-none" />
                  </div>
                  {selectedDocumentType === "national-id" && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium block mb-1.5">Document Back Base64</label>
                      <textarea {...register("document_back_base64")} rows={3} className="input-base resize-none" />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium block mb-1.5">Selfie Base64</label>
                    <textarea {...register("selfie_base64")} rows={3} className="input-base resize-none" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide Passport + Selfie or National ID + Selfie in base64 to submit KYC at creation.
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input {...register("has_accepted_terms")} type="checkbox" className="mt-1 accent-primary" />
                <span>I confirm the customer has accepted terms and conditions.</span>
              </label>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
                  {createMutation.isPending ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
