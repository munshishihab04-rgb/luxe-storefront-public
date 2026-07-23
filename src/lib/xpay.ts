import type { CartItem } from "../types/product.ts";

export type XPayCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type XPayShipping = {
  address: string;
  city: string;
  zip: string;
  country: string;
  method: string;
};

export type CreateXPayPaymentInput = {
  customer: XPayCustomer;
  shipping: XPayShipping;
  items: CartItem[];
};

export type CreateXPayPaymentResponse = {
  ok: boolean;
  provider?: "nexi-xpay";
  environment?: "test" | "production" | string;
  codTrans?: string;
  amountCents?: number;
  paymentUrl?: string;
  error?: string;
  message?: string;
};

export function cartItemsForPayment(items: CartItem[]) {
  return items.map((item) => {
    const unitPrice = item.product.salePrice ?? item.product.price;
    return {
      productId: item.productId,
      variantId: item.variantId,
      title: item.product.title,
      brand: item.product.brand,
      quantity: item.quantity,
      unitPrice,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    };
  });
}

export async function createXPayPayment(input: CreateXPayPaymentInput): Promise<CreateXPayPaymentResponse> {
  const response = await fetch("/api/xpay/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: input.customer,
      shipping: input.shipping,
      items: cartItemsForPayment(input.items),
    }),
  });

  const data = (await response.json()) as CreateXPayPaymentResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.message || data.error || "Impossibile avviare il pagamento Nexi XPay");
  }
  if (!data.paymentUrl) {
    throw new Error("Risposta XPay non valida: paymentUrl mancante");
  }
  return data;
}
