"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { SearchField } from "@/components/shared/search-field";
import { Topbar } from "@/components/shared/topbar";
import { EmptyState } from "@/components/ui";
import { useToast } from "@/components/ui/toaster";
import { createCustomerBaseSchema, type CreateCustomerInput } from "@/lib/validations/index";
import { createCustomer, getCustomers, verifyCustomer } from "@/lib/api/service";
import type { Customer, CustomerIdentifyingInformation } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
        ...values,
        type: "individual",
        address: { ...values.address, country_id: values.country_id },
        identifying_information: buildIdentifyingInformation(values),
      }),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer created", description: customer.email, variant: "success" });
      setPanelOpen(false);
      reset();
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
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Verification submitted", variant: "success" });
      if (selectedCustomer?.id === customer.id) setSelectedCustomer(customer);
    },
  });

  const handleNew = () => {
    setSelectedCustomer(null);
    reset();
    setPanelOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPanelOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <Topbar
        title="Customers"
        description="Verify and manage your individual client base"
        actions={
          <button onClick={handleNew} className="btn-primary py-1.5 h-8">
            <Icon icon="solar:user-plus-bold-duotone" className="w-4 h-4" />
            New Customer
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search customers..." />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Icon icon="solar:users-group-rounded-bold-duotone" className="w-7 h-7" />}
            title="No customers yet"
            description="Add individual customers to manage their KYC and payment history."
          />
        ) : (
          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleView(customer)}
                className="group flex items-center gap-3 bg-card hover:bg-slate-50/50 p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon icon="solar:user-bold-duotone" className="w-5 h-5" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs truncate text-slate-800">
                      {customer.first_name} {customer.last_name}
                    </h4>
                    {customer.status === "active" && (
                      <Icon icon="solar:check-circle-bold-duotone" className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {customer.email}
                  </p>
                </div>

                <div className="hidden sm:block text-right px-3">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg",
                    customer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {customer.status.replace("_", " ")}
                  </span>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                    Joined {formatDate(customer.created_at)}
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
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={() => setPanelOpen(false)} />
        
        <div 
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl transition-transform duration-300 ease-out transform border-l border-border/50",
            panelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {selectedCustomer ? "Customer Profile" : "Register Customer"}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {selectedCustomer ? `Viewing details for ${selectedCustomer.first_name}` : "Set up a new individual profile"}
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {selectedCustomer ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={cn(
                    "p-5 rounded-[1.5rem] flex items-center justify-between border border-border/40",
                    selectedCustomer.status === "active" ? "bg-emerald-50/50" : "bg-amber-50/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                        selectedCustomer.status === "active" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                      )}>
                        <Icon icon="solar:shield-check-bold-duotone" className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">Identity {selectedCustomer.status === "active" ? "Verified" : "Pending"}</p>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          {selectedCustomer.status === "active" ? "Full transactional access enabled." : "KYC required for full activation."}
                        </p>
                      </div>
                    </div>
                    {selectedCustomer.status === "inactive" && (
                      <button 
                        onClick={() => verifyMutation.mutate(selectedCustomer.id)}
                        disabled={verifyMutation.isPending}
                        className="btn-primary py-1 h-8 text-[10px] uppercase tracking-wider"
                      >
                        {verifyMutation.isPending ? "Pending..." : "Verify"}
                      </button>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 p-3 rounded-xl bg-secondary/30 border border-border/20">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Icon icon="solar:letter-bold-duotone" className="w-3 h-3 text-primary" /> Email
                      </p>
                      <p className="text-xs font-bold text-slate-800">{selectedCustomer.email}</p>
                    </div>
                    <div className="space-y-1 p-3 rounded-xl bg-secondary/30 border border-border/20">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Icon icon="solar:phone-bold-duotone" className="w-3 h-3 text-primary" /> Phone
                      </p>
                      <p className="text-xs font-bold text-slate-800">{selectedCustomer.phone}</p>
                    </div>
                    <div className="space-y-1 p-3 rounded-xl bg-secondary/30 border border-border/20">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3 text-primary" /> Birth Date
                      </p>
                      <p className="text-xs font-bold text-slate-800">{selectedCustomer.birth_date}</p>
                    </div>
                    <div className="space-y-1 p-3 rounded-xl bg-secondary/30 border border-border/20">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Icon icon="solar:global-bold-duotone" className="w-3 h-3 text-primary" /> Country
                      </p>
                      <p className="text-xs font-bold text-slate-800">{selectedCustomer.country_id}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1 p-4 rounded-xl bg-secondary/30 border border-border/20">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2">
                        <Icon icon="solar:map-point-bold-duotone" className="w-3 h-3 text-primary" /> Residential Address
                      </p>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">
                        {selectedCustomer.address.address_line_1},<br />
                        {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.postal_code}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} id="customer-form" className="space-y-6 pb-8">
                  <div className="space-y-3">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Personal Details</h6>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">First Name</label>
                        <input {...register("first_name")} className="input-base h-10" />
                        {errors.first_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.first_name.message}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Last Name</label>
                        <input {...register("last_name")} className="input-base h-10" />
                        {errors.last_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.last_name.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold block mb-1 text-slate-700">Email</label>
                        <input {...register("email")} type="email" className="input-base h-10" />
                        {errors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.email.message}</p>}
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold block mb-1 text-slate-700">Phone</label>
                        <input {...register("phone")} placeholder="+234..." className="input-base h-10" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h6 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Location & Identity</h6>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Birth Date</label>
                        <input {...register("birth_date")} placeholder="DD-MM-YYYY" className="input-base h-10" />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Country Code</label>
                        <input {...register("country_id")} placeholder="NG" className="input-base h-10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-bold block mb-1 text-slate-700">City</label>
                        <input {...register("address.city")} className="input-base h-10" />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-slate-700">Postal Code</label>
                        <input {...register("address.postal_code")} className="input-base h-10" />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/30 cursor-pointer border border-border/30">
                    <input {...register("has_accepted_terms")} type="checkbox" className="mt-0.5 w-3.5 h-3.5 rounded accent-primary" />
                    <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                      I confirm this customer has accepted the terms and conditions and I have permission to handle their data.
                    </p>
                  </label>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-slate-50/50">
              {selectedCustomer ? (
                <button 
                  onClick={() => setPanelOpen(false)}
                  className="w-full h-10 rounded-xl bg-white border border-border font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Close Profile
                </button>
              ) : (
                <div className="flex gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setPanelOpen(false)}
                    className="flex-1 h-10 px-4 rounded-xl bg-white border border-border font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    form="customer-form"
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="flex-[1.5] btn-primary justify-center h-10"
                  >
                    <Icon icon="solar:user-plus-bold-duotone" className="w-4 h-4" />
                    {createMutation.isPending ? "Creating..." : "Register Customer"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
