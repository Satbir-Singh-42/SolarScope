import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Try to parse error as JSON for better error messages
    try {
      const errorData = JSON.parse(text);
      const actualError = errorData.error || errorData.message || text;
      
      // Check for specific validation errors and provide clearer messages
      if (actualError.includes('does not show solar panels') || actualError.includes('solar panels or photovoltaic equipment')) {
        throw new Error('Please upload a solar panel image for fault detection. Rooftop images should be used for installation analysis instead.');
      }
      
      if (actualError.includes('does not show a rooftop') || actualError.includes('rooftop suitable for solar panel installation')) {
        throw new Error('Please upload a rooftop or building image for installation analysis. Solar panel images should be used for fault detection instead.');
      }
      
      throw new Error(actualError);
    } catch (parseError) {
      // If JSON parsing fails, throw the original error
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

// Health check function to verify backend connectivity
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      credentials: 'include',
    });
    return res.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  let headers: Record<string, string> = {};
  let body: any = undefined;

  if (data) {
    if (data instanceof FormData) {
      // Don't set Content-Type for FormData, let browser set it with boundary
      body = data;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Enhanced error handling for backend connectivity
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend not connected properly. Please check if the server is running.');
    }
    
    if (error instanceof Error && error.message.includes('NetworkError')) {
      throw new Error('Network connection failed. Please check your internet connection and server status.');
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
