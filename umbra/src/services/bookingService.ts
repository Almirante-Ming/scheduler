import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

// API Base URL - replace with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types for API requests and responses
export interface BookingData {
  id?: string;
  date: string;
  times: string[];
  userName: string;
  course: string;
  annotation: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  labId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface BookingResponse {
  bookings: BookingData[];
  availableTimeSlots: string[];
  courses: { id: string; name: string }[];
}

export interface CreateBookingRequest {
  date: string;
  times: string[];
  userName: string;
  course: string;
  annotation: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  labId?: string;
}

export interface CreateBookingResponse {
  booking: BookingData;
  message: string;
  success: boolean;
}

export interface LabBookingResponse {
  lab_name: string;
  lab_nickname: string;
  schedules: LabScheduleItem[];
}

export interface LabScheduleItem {
  id: string;
  user_id: string; // Bypassed on login
  course: string;
  date: string; // YYYY-MM-DD
  times: string[]; // Array of time slots like ["09:00", "10:00"]
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string; // ISO 8601 datetime
}

// API Service functions
export const bookingService = {
  // Get all bookings for a specific date range
  getBookings: async (startDate?: string, endDate?: string): Promise<BookingResponse> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/bookings?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get bookings for a specific date
  getBookingsByDate: async (date: string): Promise<BookingData[]> => {
    try {
      const response = await api.get(`/bookings/date/${date}`);
      return response.data.bookings;
    } catch (error) {
      console.error('Error fetching bookings by date:', error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (bookingData: CreateBookingRequest): Promise<CreateBookingResponse> => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update an existing booking
  updateBooking: async (id: string, bookingData: Partial<BookingData>): Promise<CreateBookingResponse> => {
    try {
      const response = await api.put(`/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Delete a booking
  deleteBooking: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // Get available time slots for a specific date
  getAvailableTimeSlots: async (date: string, labId?: string): Promise<string[]> => {
    try {
      const params = new URLSearchParams();
      if (labId) params.append('labId', labId);
      
      const response = await api.get(`/bookings/available-slots/${date}?${params.toString()}`);
      return response.data.availableTimeSlots;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async (userId: string): Promise<BookingData[]> => {
    try {
      const response = await api.get(`/bookings/user/${userId}`);
      return response.data.bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get bookings by lab with lab details
  getBookingsByLab: async (labId: string, startDate?: string, endDate?: string): Promise<LabBookingResponse> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/bookings/lab/${labId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lab bookings:', error);
      throw error;
    }
  }
};

export default api;
