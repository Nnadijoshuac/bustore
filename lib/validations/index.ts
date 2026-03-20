import { z } from "zod";

const optionalPositiveNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().positive().optional());

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  business_name: z.string().optional(),
  country: z.string().min(2, "Country is required"),
});

export const createPaymentLinkSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80),
  description: z.string().min(3, "Description must be at least 3 characters").max(300).optional().or(z.literal("")),
  amount: optionalPositiveNumber,
  currency: z.enum(["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR"]),
  target_currency: z.enum(["USDT", "BTC", "NGN", "USD", "KES"]).default("USDT"),
  one_time: z.boolean().default(false),
  allow_customer_amount: z.boolean().default(false),
  min_amount: optionalPositiveNumber,
  max_amount: optionalPositiveNumber,
  redirect_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  expires_at: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.allow_customer_amount && data.amount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Remove the fixed amount when customer amount is allowed.",
      path: ["amount"],
    });
  }

  if (data.allow_customer_amount && (!data.min_amount || !data.max_amount)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Set both minimum and maximum amounts when customer amount is allowed.",
      path: ["min_amount"],
    });
  }

  if (data.min_amount && data.max_amount && data.min_amount > data.max_amount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Minimum amount cannot exceed maximum amount.",
      path: ["min_amount"],
    });
  }
});

export const createRecipientSchema = z.object({
  name: z.string().min(2, "Recipient name is required"),
  email: z.string().email().optional().or(z.literal("")),
  bank_name: z.string().min(2, "Bank name is required"),
  bank_account_number: z.string().min(6, "Account number is required"),
  bank_account_name: z.string().min(2, "Account name is required"),
  country: z.string().min(2, "Country is required"),
  currency: z.enum(["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR"]),
});

export const createSettlementSchema = z.object({
  recipient_id: z.string().min(1, "Select a recipient"),
  amount_usd: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(50000, "Max single settlement is $50,000"),
  note: z.string().max(200).optional(),
});

export const webhookSchema = z.object({
  url: z.string().url("Enter a valid webhook URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

export const customerAddressSchema = z.object({
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  county: z.string().optional(),
  country_id: z.string().length(2, "Use a 2-letter country code"),
  address_line_1: z.string().min(3, "Address line 1 is required"),
  address_line_2: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().min(3, "Postal code is required"),
});

export const identifyingInformationSchema = z.object({
  type: z.enum(["passport", "national-id", "selfie"]),
  number: z.string().optional(),
  country: z.string().length(2, "Use a 2-letter country code"),
  image_front: z.string().min(1, "Base64 image is required"),
  image_back: z.string().optional(),
});

export const createCustomerBaseSchema = z.object({
  email: z.string().email("Enter a valid email"),
  has_accepted_terms: z.boolean().refine(Boolean, "Terms must be accepted"),
  type: z.literal("individual"),
  country_id: z.string().length(2, "Use a 2-letter country code"),
  phone: z.string().min(8, "Phone number is required"),
  birth_date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Use DD-MM-YYYY"),
  first_name: z.string().min(2, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name is required"),
  address: customerAddressSchema,
  identifying_information: z.array(identifyingInformationSchema).optional(),
});

export const createCustomerSchema = createCustomerBaseSchema.superRefine((data, ctx) => {
  if (!data.identifying_information?.length) {
    return;
  }

  const hasSelfie = data.identifying_information.some((item) => item.type === "selfie");
  const document = data.identifying_information.find((item) => item.type !== "selfie");

  if (!hasSelfie) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A selfie image is required when submitting KYC documents.",
      path: ["identifying_information"],
    });
  }

  if (!document) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Add a passport or national ID document with the selfie.",
      path: ["identifying_information"],
    });
    return;
  }

  if (!document.number) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Document number is required.",
      path: ["identifying_information"],
    });
  }

  if (document.type === "national-id" && !document.image_back) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "National ID back image is required.",
      path: ["identifying_information"],
    });
  }
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>;
export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
