import {
	NexiosConfig as NexiosConfig,
	NexiosOptions,
	NexiosResponse,
	NexiosError,
	NexiosHeaders,
	CacheOptions,
	CredentialsOptions,
} from './types';

export const defaultHeaders: NexiosHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
};

export const defaultConfig: NexiosConfig = {
	baseURL: '',
	headers: defaultHeaders,
	credentials: 'include',
	cache: 'force-cache',
	timeout: 10000,
};

/**
 * Nexios is a fetch wrapper that mimics the behavior of axios, designed for use with Next.js.
 */
class Nexios {
	// Default request configuration, can be optionally overriding in constructor
	baseURL?: string;
	headers?: NexiosHeaders;
	credentials?: CredentialsOptions;
	cache?: CacheOptions;
	timeout?: number;

	constructor(config: NexiosConfig = defaultConfig) {
		this.baseURL = config.baseURL || defaultConfig.baseURL;
		this.headers = config.headers || defaultConfig.headers;
		this.credentials = config.credentials || defaultConfig.credentials;
		this.cache = config.cache || defaultConfig.cache;
		this.timeout = config.timeout || defaultConfig.timeout;
	}

	setAuthHeader(token: string, isBearer: boolean = true) {
		this.headers = { ...this.headers, Authorization: isBearer ? `Bearer ${token}` : token };
	}

	setCacheOption(option: CacheOptions) {
		this.cache = option;
	}

	async request<T = unknown>(
		url: string,
		options: NexiosOptions = { method: 'GET' },
	): Promise<NexiosResponse<T>> {
		const urlObj = new URL(`${this.baseURL}${url}`);
		if (options.params)
			Object.entries(options.params).forEach(([k, v]) =>
				urlObj.searchParams.append(k, v.toString()),
			);

		const response = await fetch(urlObj.toString(), {
			...options,
			headers: {
				...this.headers,
				...(options.headers || {}),
			},
			cache: this.cache,
			credentials: this.credentials,
		});

		if (!response.ok) throw new NexiosError(response);

		return new NexiosResponse<T>(response);
	}

	async get<T = unknown>(url: string, config: NexiosOptions = {}): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'GET' });
	}

	async post<T = unknown>(
		url: string,
		data: object,
		config: NexiosOptions = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) });
	}

	async put<T = unknown>(
		url: string,
		data: object,
		config: NexiosOptions = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) });
	}

	async patch<T = unknown>(
		url: string,
		data: object,
		config: NexiosOptions = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'PATCH', body: JSON.stringify(data) });
	}

	async delete<T = unknown>(url: string, config: NexiosOptions = {}): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'DELETE' });
	}
}

export default Nexios;
