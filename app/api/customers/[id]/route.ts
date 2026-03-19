import { NextResponse } from "next/server";
import { findCustomerById, upsertCustomer } from "@/lib/api/customer-store";
import { createBushaClient } from "@/lib/api/busha-client";
import { normalizeCustomer } from "@/lib/api/busha-normalizers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const busha = createBushaClient();
    const result = await busha.get<{ data?: Record<string, unknown> }>(`/v1/customers/${id}`);

    if (!result.data) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const customer = await upsertCustomer(normalizeCustomer(result.data));
    return NextResponse.json({ data: customer });
  } catch {
    const { id } = await params;
    const customer = await findCustomerById(id);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({ data: customer });
  }
}

