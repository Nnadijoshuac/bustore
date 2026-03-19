import { NextResponse } from "next/server";
import { findCustomerById, upsertCustomer } from "@/lib/api/customer-store";
import type { Customer } from "@/types";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeCustomer } from "@/lib/api/busha-normalizers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const busha = createBushaClient();
    const verifyResult = await busha.post<{ message?: string }>(`/v1/customers/${id}/verify`);
    const customerResult = await busha.get<{ data?: Record<string, unknown> }>(`/v1/customers/${id}`);

    const existingCustomer = await findCustomerById(id);
    const customer = await upsertCustomer(
      customerResult.data
        ? normalizeCustomer(customerResult.data, existingCustomer)
        : {
            ...(existingCustomer as Customer),
            status: "in_review",
          }
    );

    return NextResponse.json({
      data: customer,
      message: verifyResult.message || "Customer verified successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify customer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
