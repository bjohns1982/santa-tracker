const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  register: (email: string, password: string, name: string) =>
    request<{ tourGuide: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ tourGuide: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Tours
  createTour: (name: string, city: string, state: string, zipCode: string) =>
    request<any>('/tours', {
      method: 'POST',
      body: JSON.stringify({ name, city, state, zipCode }),
    }),

  getTours: () => request<any[]>('/tours'),

  getTour: (id: string) => request<any>(`/tours/${id}`),

  getTourByInviteCode: (inviteCode: string) =>
    request<any>(`/tours/invite/${inviteCode}`),

  updateTourStatus: (tourId: string, status: string) =>
    request<any>(`/tours/${tourId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateFamilyOrder: (tourId: string, familyOrders: { familyId: string; order: number }[]) =>
    request<any>(`/tours/${tourId}/families/order`, {
      method: 'PATCH',
      body: JSON.stringify({ familyOrders }),
    }),

  deleteTour: (tourId: string) =>
    request<any>(`/tours/${tourId}`, {
      method: 'DELETE',
    }),

  // Families
  createFamily: (inviteCode: string, data: {
    streetNumber: string;
    streetName: string;
    familyName: string;
    children: { firstName: string; specialInstructions?: string }[];
  }) =>
    request<any>(`/families/invite/${inviteCode}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFamily: (familyId: string, data: {
    streetNumber: string;
    streetName: string;
    familyName: string;
    children: { firstName: string; specialInstructions?: string }[];
  }) =>
    request<any>(`/families/${familyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFamily: (familyId: string) =>
    request<any>(`/families/${familyId}`, {
      method: 'DELETE',
    }),

  getFamily: (familyId: string) => request<any>(`/families/${familyId}`),

  // Visits
  startTour: (tourId: string) =>
    request<any>(`/visits/${tourId}/start`, {
      method: 'POST',
    }),

  updateVisitStatus: (visitId: string, status: string) =>
    request<any>(`/visits/${visitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  requeueVisit: (visitId: string) =>
    request<any>(`/visits/${visitId}/requeue`, {
      method: 'POST',
    }),

  updateSantaLocation: (tourId: string, latitude: number, longitude: number) =>
    request<any>(`/visits/${tourId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    }),

  getCurrentVisit: (tourId: string) =>
    request<any>(`/visits/tour/${tourId}/current`),

  // Jokes
  getRandomJoke: () => request<any>('/jokes/random'),
  getNextJoke: () => request<any>('/jokes/next'),
};

