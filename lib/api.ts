// API Helper Functions for MongoDB

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  retries: number = 1
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Bir hata oluştu' };
      }
      
      const errorMessage = errorData.error || errorData.message || 'Bir hata oluştu';
      
      // MongoDB connection errors için özel mesaj
      if (errorMessage.includes('MongoDB Atlas') || errorMessage.includes('whitelist') || errorMessage.includes('Could not connect')) {
        throw new ApiError(
          response.status,
          'MongoDB bağlantı hatası: IP adresiniz MongoDB Atlas whitelist\'inde değil. Lütfen MongoDB Atlas yönetim panelinden IP adresinizi ekleyin. Detaylar için MONGODB_IP_WHITELIST.md dosyasına bakın.'
        );
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Retry logic for network errors
    if (retries > 0 && (error.name === 'AbortError' || error.name === 'TypeError')) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return fetchApi<T>(endpoint, options, retries - 1);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors için özel mesaj
    const errorMessage = error.message || 'Bağlantı hatası. Lütfen tekrar deneyin.';
    throw new ApiError(0, errorMessage);
  }
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<any[]>('/categories'),
  getById: (id: string) => fetchApi<any>(`/categories/${id}`),
  create: (data: any) =>
    fetchApi<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Products API
export const productsApi = {
  getAll: (params?: {
    category_id?: string;
    store_type?: string;
    is_featured?: boolean;
    is_active?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.store_type) queryParams.append('store_type', params.store_type);
    if (params?.is_featured !== undefined)
      queryParams.append('is_featured', params.is_featured.toString());
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());

    const query = queryParams.toString();
    return fetchApi<any[]>(`/products${query ? `?${query}` : ''}`);
  },
  getFeatured: () => fetchApi<any[]>('/products/featured'),
  getById: (id: string, includeSubItems: boolean = false) => 
    fetchApi<any>(`/products/${id}${includeSubItems ? '?include_sub_items=true' : ''}`),
  create: (data: any) =>
    fetchApi<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Sales API
export const salesApi = {
  getAll: (params?: { month?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month);
    const query = queryParams.toString();
    return fetchApi<any[]>(`/sales${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => fetchApi<any>(`/sales/${id}`),
  create: (data: any) =>
    fetchApi<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/sales/${id}`, {
      method: 'DELETE',
    }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

