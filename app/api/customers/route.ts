import { NextResponse } from "next/server";
import type { CreateCustomerInput, Customer } from "@/types";
import { listCustomers, upsertCustomer } from "@/lib/api/customer-store";
import { createCustomerSchema } from "@/lib/validations/index";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeCustomer } from "@/lib/api/busha-normalizers";

export async function GET() {
  try {
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown>[] }>("/v1/customers");

    if (!result.data) {
      return NextResponse.json({ data: await listCustomers() });
    }

    const customers = await Promise.all(
      result.data.map(async (item) => upsertCustomer(normalizeCustomer(item)))
    );

    return NextResponse.json({ data: customers });
  } catch {
    return NextResponse.json({ data: await listCustomers() });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateCustomerInput;
    const parsedInput = createCustomerSchema.safeParse(payload);
    const busha = createBushaClient();

    if (!parsedInput.success) {
      const issue = parsedInput.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Invalid customer payload." }, { status: 400 });
    }

    const result = await busha.post<{
      message?: string;
      data?: Record<string, unknown>;
    }>("/v1/customers", parsedInput.data);

    if (!result.data) {
      return NextResponse.json({ error: "Busha did not return a customer." }, { status: 502 });
    }

    const customer = await upsertCustomer(normalizeCustomer(result.data));
    return NextResponse.json({ data: customer, message: result.message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create customer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
