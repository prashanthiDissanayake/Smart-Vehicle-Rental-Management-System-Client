import { getAuthHeaders } from './authService';

const API_URL = 'http://127.0.0.1:5000';

export interface BookingData {
  id: string;
  userId: string;
  vehicleId: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  duration: number;
  vehiclePerDay: number;
  driverPerDay: number;
  addonsTotal: number;
  totalAmount: number;
  status: string;
  addOns: any[];
}

export const createBooking = async (bookingData: BookingData) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

export const fetchBookings = async (): Promise<BookingData[]> => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      headers: {
        ...getAuthHeaders()
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch bookings error:', error);
    throw error;
  }
};
