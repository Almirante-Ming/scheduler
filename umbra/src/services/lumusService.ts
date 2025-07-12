import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

// API Base URL - Lumus backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types for API requests and responses
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  type: 'admin' | 'user';
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'user';
  phone?: string;
  bio?: string;
  is_active: boolean;
  last_login?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  nickname: string;
  course_code: string;
  period: string;
  capacity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  course_id: number;
  course?: Course;
  phone?: string;
  registration_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  date: string;
  times: string[];
  user_name: string;
  course_code: string;
  annotation?: string;
  repeat_type: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lab_nickname: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Lab {
  nickname: string;
  name: string;
  capacity: number;
  location?: string;
  active_bookings?: number;
  available?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  permissions: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
  };
}

// Authentication Service
export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    
    // Store auth token and user data
    localStorage.setItem('authToken', response.data.access_token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
    
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    // First register the user
    await api.post('/auth/register', data);
    
    // Then login to get the access token
    const loginResponse = await api.post('/auth/login', {
      email: data.email,
      password: data.password
    });
    
    // Store auth token and user data
    localStorage.setItem('authToken', loginResponse.data.access_token);
    localStorage.setItem('userData', JSON.stringify(loginResponse.data.user));
    
    return loginResponse.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  getStoredUser(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

// Users Service
export const usersService = {
  async getUsers(params?: { page?: number; per_page?: number; search?: string; type?: string; active?: boolean }): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users', { params });
    return {
      data: response.data.users,
      pagination: response.data.pagination
    };
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};

// Courses Service
export const coursesService = {
  async getCourses(params?: { page?: number; per_page?: number; search?: string; period?: string }): Promise<PaginatedResponse<Course>> {
    const response = await api.get('/courses', { params });
    return {
      data: response.data.courses,
      pagination: response.data.pagination
    };
  },

  async getCourse(id: number): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    const response = await api.post('/courses', data);
    return response.data;
  },

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  async getCourseStudents(id: number): Promise<{ course: Course; students: Student[]; total_students: number }> {
    const response = await api.get(`/courses/${id}/students`);
    return response.data;
  }
};

// Students Service
export const studentsService = {
  async getStudents(params?: { page?: number; per_page?: number; search?: string; course_id?: number }): Promise<PaginatedResponse<Student>> {
    const response = await api.get('/students', { params });
    return {
      data: response.data.students,
      pagination: response.data.pagination
    };
  },

  async getStudent(id: number): Promise<Student> {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async createStudent(data: Partial<Student>): Promise<Student> {
    const response = await api.post('/students', data);
    return response.data;
  },

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  async deleteStudent(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  async getStudentByEmail(email: string): Promise<Student> {
    const response = await api.get(`/students/by-email/${email}`);
    return response.data;
  },

  async getStudentByRegistration(registrationNumber: string): Promise<Student> {
    const response = await api.get(`/students/by-registration/${registrationNumber}`);
    return response.data;
  }
};

// Schedules Service
export const schedulesService = {
  async getSchedules(params?: { 
    page?: number; 
    per_page?: number; 
    start_date?: string; 
    end_date?: string; 
    lab_nickname?: string; 
    course_code?: string; 
    user_id?: string; 
    status?: string; 
  }): Promise<PaginatedResponse<Schedule>> {
    const response = await api.get('/schedules', { params });
    return {
      data: response.data.schedules,
      pagination: response.data.pagination
    };
  },

  async getSchedule(id: number): Promise<Schedule> {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.post('/schedules', data);
    return response.data;
  },

  async updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/schedules/${id}`);
  },

  async getSchedulesByDate(date: string): Promise<{ date: string; schedules: Schedule[]; total: number }> {
    const response = await api.get(`/schedules/by-date/${date}`);
    // The API now returns an array directly, not an object with date/schedules/total
    const schedules = response.data;
    return {
      date,
      schedules,
      total: schedules.length
    };
  },

  async getSchedulesByLab(labNickname: string, params?: { start_date?: string; end_date?: string }): Promise<{ lab_nickname: string; schedules: Schedule[]; total: number }> {
    const response = await api.get(`/schedules/by-lab/${labNickname}`, { params });
    return response.data;
  }
};

// Lab Service
export const labService = {
  async getLabs(): Promise<Lab[]> {
    const response = await api.get('/labs');
    return response.data.labs;
  },

  async getLabByNickname(nickname: string): Promise<Lab> {
    const response = await api.get(`/labs/${nickname}`);
    return response.data;
  },

  async getLabAvailability(nickname: string, params?: { start_date?: string; end_date?: string }): Promise<{
    lab: Lab;
    schedules: Schedule[];
    total_bookings: number;
  }> {
    const response = await api.get(`/labs/${nickname}/availability`, { params });
    return response.data;
  },

  async createLab(data: { name: string; nickname: string; capacity: number; location?: string }): Promise<Lab> {
    const response = await api.post('/labs', data);
    return response.data;
  }
};

// Public Services (no auth required)
export const publicService = {
  async getCourses(): Promise<Course[]> {
    const response = await api.get('/courses/public');
    return response.data.courses;
  },
  
  async getSchedules(): Promise<Schedule[]> {
    const response = await api.get('/schedules/public');
    return response.data.schedules;
  },
  
  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.post('/schedules/public', data);
    return response.data;
  }
};

// Export all services
export {
  api,
  API_BASE_URL
};

// Default export for backward compatibility
export default {
  auth: authService,
  users: usersService,
  courses: coursesService,
  students: studentsService,
  schedules: schedulesService,
  labs: labService
};
