import { getAuthHeaders } from "./authService";

const API_URL = "http://127.0.0.1:5000";

export interface PaymentData {
  id: string;
  bookingId: string;
  userId: string;
  vehicleId?: string;
  ad_amount: number;
  amount: number;
  type: "full" | "advance";
  method: string;
  date: string;
  status: string;
}

export const processPayment = async (paymentData: PaymentData) => {
  try {
    const response = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Payment failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Process payment error:", error);
    throw error;
  }
};

export const updatePayment = async (id: string, updateData: any) => {
  try {
    const response = await fetch(`${API_URL}/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Payment update failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Update payment error:", error);
    throw error;
  }
};

export const fetchPayments = async (): Promise<PaymentData[]> => {
  try {
    const response = await fetch(`${API_URL}/payments`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch payments");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch payments error:", error);
    throw error;
  }
};
