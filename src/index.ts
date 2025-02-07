import InterceptorManager from './interceptors';
import { NexiosConfig, NexiosHeaders } from './interfaces';
import NexiosError from './NexiosError';
import NexiosRequest from './NexiosRequest';
import NexiosResponse from './NexiosResponse';
import { Params } from './types';
import { Axios, AxiosHeaders, AxiosResponse } from 'axios';

// With default Axios Config (unimplemented features commented out)
export const defaultConfig: NexiosConfig = {
	method: 'GET',
	baseURL: '',
	bypassBaseURL: false,
	timeout: 1000,
	credentials: 'include',
	cache: 'force-cache',
	headers: new Headers(),
	responseType: 'json',
	// responseEncoding: 'utf8',
	xsrfCookieName: 'XSRF-TOKEN',
	xsrfHeaderName: 'X-XSRF-TOKEN',
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
	defaults: NexiosConfig;

	interceptors: {
		request: InterceptorManager<NexiosConfig>;
		response: InterceptorManager<NexiosResponse>;
	};

	get baseURL() {
		return this.defaults.baseURL;
	}

	constructor(config?: NexiosConfig) {
		const mergedDefaults = { ...defaultConfig, ...config };
		this.defaults = mergedDefaults;
		this.transformErrorMsg = config?.transformErrorMsg || this.transformErrorMsg;
		this.interceptors = {
			request: new InterceptorManager<NexiosConfig>(),
			response: new InterceptorManager<NexiosResponse>(),
		};
	}

	async request<T = unknown>(config: NexiosConfig): Promise<NexiosResponse<T>> {
		try {
			const mergedConfig = this.mergeConfig(config);
			const interceptedConfig = await this.runRequestInterceptors(mergedConfig);
			interceptedConfig.signal = this.handleTimeout(interceptedConfig.timeout);

			const { url, init } = new NexiosRequest(interceptedConfig);
			const rawResponse = await fetch(url, init);

			const response = new NexiosResponse<T>(rawResponse, config);
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
		return this.request<T>({ ...config, url, method: 'GET' });
	}

	async post<T = unknown>(
		url: string,
		data: any,
		config?: NexiosConfig,
	): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'POST', data });
	}

	async put<T = unknown>(
		url: string,
		data: any,
		config?: NexiosConfig,
	): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'PUT', data });
	}

	async patch<T = unknown>(
		url: string,
		data: any,
		config?: NexiosConfig,
	): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'PATCH', data });
	}

	async delete<T = unknown>(url: string, config?: NexiosConfig): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'DELETE' });
	}

	setAuthHeader(token: string, isBearer: boolean = true) {
		this.defaults.headers = {
			...this.defaults.headers,
			Authorization: isBearer ? `Bearer ${token}` : token,
		} as NexiosHeaders;
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

	private mergeConfig(config?: NexiosConfig): NexiosConfig {
		return {
			...this.defaults,
			...config,
			headers: {
				...this.defaults.headers,
				...config?.headers,
			} as NexiosHeaders,
		};
	}

	private handleTimeout(timeout?: number): AbortSignal {
		const abortController = new AbortController();
		if (timeout) {
			const id = setTimeout(() => abortController.abort(), timeout);
			id.unref(); // prevent leaks
		}
		return abortController.signal;
	}
}

export default Nexios;
