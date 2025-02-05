import { NexiosOptions, NexiosConfig } from './interfaces';
import NexiosError from './NexiosError';
import NexiosResponse from './NexiosResponse';
import { NexiosHeaders } from './types';

export const defaultHeaders: NexiosHeaders = {
	'content-type': 'application/json',
	accept: 'application/json',
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
	baseURL?: string;
	headers?: NexiosHeaders;
	credentials?: RequestCredentials;
	cache?: RequestCache;
	timeout?: number;

	constructor(config: NexiosConfig = defaultConfig) {
		this.baseURL = config.baseURL || defaultConfig.baseURL;
		this.headers = { ...defaultHeaders, ...config.headers };
		this.credentials = config.credentials || defaultConfig.credentials;
		this.cache = config.cache || defaultConfig.cache;
		this.timeout = config.timeout || defaultConfig.timeout;
		this.parseError = config.parseError || this.parseError;
	}

	async request<T = unknown>(url: string, options: NexiosOptions = {}): Promise<NexiosResponse<T>> {
		const urlObj = new URL(`${this.baseURL}${url}`);
		if (options.params)
			Object.entries(options.params).forEach(([k, v]) =>
				urlObj.searchParams.append(k, v.toString()),
			);

		const rawResponse = await fetch(urlObj.toString(), {
			...options,
			headers: {
				...this.headers,
				...(options.headers || {}),
			},
			cache: options.cache || this.cache,
			credentials: options.credentials || this.credentials,
		});

		const response = new NexiosResponse<T>(rawResponse);
		await response.tryResolveStream();

		if (!response.ok) {
			const error = new NexiosError(response);
			this.parseError(error);
			throw error;
		}

		return response;
	}

	async get<T = unknown>(url: string, config: NexiosOptions = {}): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'GET' });
	}

	async post<T = unknown>(
		url: string,
		data: object = {},
		config: NexiosOptions = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) });
	}

	async put<T = unknown>(
		url: string,
		data: object = {},
		config: NexiosOptions = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) });
	}

	async patch<T = unknown>(
		url: string,
		data: object = {},
		config: NexiosOptions = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'PATCH', body: JSON.stringify(data) });
	}

	async delete<T = unknown>(url: string, config: NexiosOptions = {}): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'DELETE' });
	}

	setAuthHeader(token: string, isBearer: boolean = true) {
		this.headers = { ...this.headers, authorization: isBearer ? `Bearer ${token}` : token };
	}

	parseError(error: NexiosError) {
		if (!error.data) error.message = error.statusMsg;
		else if (typeof error.data === 'string') error.message = error.data;
		else if (error.data.message) error.message = error.data.message;
		else if (error.data.error) error.message = error.data.error;
		else error.message = JSON.stringify(error.data);
	}
}

export default Nexios;
