/**
 * HTTP Client for making API requests
 * Handles authentication, base URL, and Next.js caching automatically
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Next.js cache options (only works in server components)
 */
export interface NextCacheOptions {
  revalidate?: number;
  tags?: string[];
}

/**
 * Request options for HTTP client
 */
export interface HttpClientRequestOptions {
  method?: HttpMethod;
  queryParams?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Next.js caching options (only works in server components)
   * If provided, the request will use Next.js fetch caching
   */
  next?: NextCacheOptions;
}

/**
 * HTTP Client class
 * Handles all API requests with automatic authentication and base URL
 */
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Make an authenticated request
   * @param token - Authentication token
   * @param endpoint - API endpoint (e.g., "/pets" or "/pets/123")
   * @param options - Request options
   */
  async request<T>(
    token: string,
    endpoint: string,
    options: HttpClientRequestOptions = {}
  ): Promise<T> {
    const { method = "GET", queryParams, body, headers = {}, next } = options;

    // Build URL with query params
    const url = this.buildUrl(endpoint, queryParams);

    // Merge headers
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
      ...headers,
    };

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for POST, PUT, PATCH, DELETE
    if (body && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Add Next.js cache options if provided (only works in server components)
    if (next) {
      (fetchOptions as RequestInit & { next?: NextCacheOptions }).next = {
        revalidate: next.revalidate,
        tags: next.tags,
      };
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (e.g., 204 No Content)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * GET request
   */
  async get<T>(
    token: string,
    endpoint: string,
    options?: Omit<HttpClientRequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(token, endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    token: string,
    endpoint: string,
    body?: unknown,
    options?: Omit<HttpClientRequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(token, endpoint, {
      ...options,
      method: "POST",
      body,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    token: string,
    endpoint: string,
    body?: unknown,
    options?: Omit<HttpClientRequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(token, endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    token: string,
    endpoint: string,
    body?: unknown,
    options?: Omit<HttpClientRequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(token, endpoint, {
      ...options,
      method: "PATCH",
      body,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    token: string,
    endpoint: string,
    options?: Omit<HttpClientRequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(token, endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | undefined>
  ): string {
    // Remove leading slash from endpoint if baseUrl already has trailing slash
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    const baseUrl = this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;

    let url = `${baseUrl}/${cleanEndpoint}`;

    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }
}

/**
 * Default HTTP client instance
 * Use this for all API calls
 */
export const httpClient = new HttpClient();
