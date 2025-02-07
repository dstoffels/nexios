import InterceptorManager from './interceptors';
import { NexiosConfig } from './interfaces';
import NexiosError from './NexiosError';
import NexiosResponse from './NexiosResponse';
import { NexiosHeaders, Params } from './types';
import { Axios } from 'axios';

export const defaultHeaders: NexiosHeaders = {
	'content-type': 'application/json',
	accept: 'application/json',
};

// With default Axios Config (unimplemented features commented out)
export const defaultConfig: NexiosConfig = {
	method: 'GET',
	baseURL: '',
	headers: defaultHeaders,
	timeout: 1000,
	credentials: 'include',
	cache: 'force-cache',
	// responseType: 'json',
	// responseEncoding: 'utf8',
	// xsrfCookieName: 'XSRF-TOKEN',
	// xsrfHeaderName: 'X-XSRF-TOKEN',
	// maxContentLength: 2000,
	// maxBodyLength: 2000,
	// maxRedirects: 5,
	// socketPath: null,
	// decompress: true,
};

/**
 * Nexios is a fetch wrapper that mimics the behavior of axios, designed for use with Next.js.
 */
class Nexios {
	baseURL: string;
	private defaultConfig: NexiosConfig;

	interceptors = {
		request: new InterceptorManager<NexiosConfig>(),
		response: new InterceptorManager<NexiosResponse>(),
	};

	constructor(config?: NexiosConfig) {
		const finalConfig = { ...defaultConfig, ...config };
		this.defaultConfig = finalConfig;
		this.baseURL = finalConfig.baseURL as string;
		this.transformErrorMsg = config?.transformErrorMsg || this.transformErrorMsg;
	}

	private async runRequestInterceptors(options: NexiosConfig): Promise<NexiosConfig> {
		let chainedOptions = options;

		this.interceptors.request.foreach(async ({ onFulfilled, onRejected }) => {
			if (onFulfilled) {
				try {
					chainedOptions = await onFulfilled(chainedOptions);
				} catch (error) {
					if (onRejected) chainedOptions = await onRejected(error);
					else throw error;
				}
			}
		});

		return chainedOptions;
	}

	private async runResponseInterceptors<T>(
		response: NexiosResponse<T>,
	): Promise<NexiosResponse<T>> {
		let chainedResponse = response;

		this.interceptors.response.foreach(async ({ onFulfilled, onRejected }) => {
			if (onFulfilled) {
				try {
					chainedResponse = (await onFulfilled(chainedResponse)) as NexiosResponse<T>;
				} catch (error) {
					if (onRejected) chainedResponse = await onRejected(error);
					else throw error;
				}
			}
		});

		return chainedResponse;
	}

	private parseURL(url: string, params?: Params): string {
		const urlObj = new URL(`${this.defaultConfig.baseURL}${url}`);

		if (params) {
			Object.entries(params).forEach(([k, v]) => urlObj.searchParams.append(k, v.toString()));
		}

		return urlObj.toString();
	}

	private mergeOptions(options?: NexiosConfig): NexiosConfig {
		return {
			...this.defaultConfig,
			...options,
			headers: {
				...this.defaultConfig.headers,
				...options?.headers,
			},
		};
	}

	async request<T = unknown>(url: string, options?: NexiosConfig): Promise<NexiosResponse<T>> {
		try {
			const mergedOptions = this.mergeOptions(options);
			const interceptedOptions = await this.runRequestInterceptors(mergedOptions);
			const parsedURL = this.parseURL(url, interceptedOptions.params);

			const rawResponse = await fetch(parsedURL, interceptedOptions);

			const response = new NexiosResponse<T>(rawResponse);
			await response.tryResolveStream();

			if (!response.ok) throw new NexiosError(response, this.transformErrorMsg);

			return await this.runResponseInterceptors(response);
		} catch (error) {
			if (error instanceof NexiosError) {
				const interceptedError = await this.runResponseInterceptors(error.response);
				error.response = interceptedError;
			}
			throw error;
		}
	}

	async get<T = unknown>(url: string, config?: NexiosConfig): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'GET' });
	}

	async post<T = unknown>(
		url: string,
		data: object = {},
		config?: NexiosConfig,
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) });
	}

	async put<T = unknown>(
		url: string,
		data: object = {},
		config?: NexiosConfig,
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) });
	}

	async patch<T = unknown>(
		url: string,
		data: object = {},
		config?: NexiosConfig,
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'PATCH', body: JSON.stringify(data) });
	}

	async delete<T = unknown>(url: string, config?: NexiosConfig): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { ...config, method: 'DELETE' });
	}

	setAuthHeader(token: string, isBearer: boolean = true) {
		this.defaultConfig.headers = {
			...this.defaultConfig.headers,
			authorization: isBearer ? `Bearer ${token}` : token,
		};
	}

	/**
	 * Called when a NexiosError is thrown due to a 400/500 response. Common patterns are checked to automatically assign the response's error details to error.message. Can be overridden directly or in the instance config to fit the error response pattern of the API this instance consumes.
	 */
	transformErrorMsg(response: NexiosResponse) {
		const data = response.data as any;

		if (typeof data === 'string') return data;
		else if (data?.message) return data.message;
		else if (data?.error) return data.error;
		else return JSON.stringify(data);
	}
}

export default Nexios;
