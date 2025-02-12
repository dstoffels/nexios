import InterceptorManager from './interceptors';
import { NexiosConfig, NexiosHeaders } from './interfaces';
import NexiosError from './NexiosError';
import NexiosRequest from './NexiosRequest';
import NexiosResponse from './NexiosResponse';
import { Params } from './types';
// import { Axios, AxiosHeaders, AxiosResponse } from 'axios';

// With default Axios Config (unimplemented features commented out)
export const defaultConfig: NexiosConfig = {
	method: 'GET',
	baseURL: '',
	bypassBaseURL: false,
	timeout: 1000,
	// credentials: 'include',
	withCredentials: true,
	cache: 'force-cache',
	headers: new Headers({ 'Content-Type': 'application/json' } as NexiosHeaders),
	responseType: 'json',
	// responseEncoding: 'utf8',
	xsrfCookieName: 'XSRF-TOKEN',
	xsrfHeaderName: 'X-XSRF-TOKEN',
	// maxContentLength: 2000,
	// maxBodyLength: 2000,
	// maxRedirects: 5,
	// socketPath: null,
	// decompress: true,
	transformErrorMsg: (response: NexiosResponse): string => {
		const data = response.data as any;

		if (typeof data === 'string') return data;
		else if (data?.message) return data.message;
		else if (data?.error) return data.error;
		else return 'An unknown error occurred';
	},
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
		// this.transformErrorMsg = config?.transformErrorMsg || this.transformErrorMsg;
		this.interceptors = {
			request: new InterceptorManager<NexiosConfig>(),
			response: new InterceptorManager<NexiosResponse>(),
		};
	}

	async request<T = unknown>(config: NexiosConfig): Promise<NexiosResponse<T>> {
		try {
			// FINALIZE CONFIG
			var mergedConfig = this.mergeConfig(config);
			var interceptedConfig = await this.runRequestInterceptors(mergedConfig);

			// TIMEOUT
			const { signal, timeoutId } = this.startTimeout(interceptedConfig.timeout as number);
			interceptedConfig.signal = signal;

			// BUILD REQUEST
			const { url, init } = new NexiosRequest(interceptedConfig);

			// SEND REQUEST
			const rawResponse = await fetch(url, init);
			clearTimeout(timeoutId);

			// BUILD RESPONSE
			const response = new NexiosResponse<T>(rawResponse, interceptedConfig);
			await response.resolveBody();

			// HANDLE RESPONSE
			if (!response.ok) {
				let message = '';
				if (interceptedConfig.transformErrorMsg)
					message = interceptedConfig.transformErrorMsg(response);
				throw new NexiosError(message, response);
			}

			// FINALIZE RESPONSE
			return await this.runResponseInterceptors(response);
		} catch (error) {
			// INTERCEPT REQUEST ERROR
			if (typeof error === 'string') throw new NexiosError(error);
			// INTERCEPT RESPONSE ERROR
			if (error instanceof NexiosError) {
				const interceptedError = await this.runResponseInterceptors(
					error.response as NexiosResponse,
				);
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
		this.defaults.headers?.set('Authorization', isBearer ? `Bearer ${token}` : token);
	}

	/**
	 * Called when a NexiosError is thrown due to a 400/500 response. Common patterns are checked to automatically assign the response's error details to error.message. Can be overridden directly or in the instance config to fit the error response pattern of the API this instance consumes.
	 */
	// transformErrorMsg<T>(response: NexiosResponse<T>): string {
	// 	const data = response.data as any;

	// 	if (typeof data === 'string') return data;
	// 	else if (data?.message) return data.message;
	// 	else if (data?.error) return data.error;
	// 	else return JSON.stringify(data);
	// }

	private async runRequestInterceptors(config: NexiosConfig): Promise<NexiosConfig> {
		let chainedConfig = config;

		this.interceptors.request.foreach(async ({ onFulfilled, onRejected }) => {
			if (onFulfilled) {
				try {
					chainedConfig = await onFulfilled(chainedConfig);
				} catch (error) {
					if (onRejected) {
						error = await onRejected(error);
					} else throw error;
				}
			}
		});

		return chainedConfig;
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
			headers: new Headers({
				...this.defaults.headers,
				...config?.headers,
			} as NexiosHeaders),
		};
	}

	private startTimeout(timeout: number): { signal: AbortSignal; timeoutId: NodeJS.Timeout } {
		const abortController = new AbortController();
		const timeoutId = setTimeout(
			() =>
				abortController.abort(
					`Request timed out after server failed to respond after ${timeout}ms`,
				),
			timeout,
		);
		timeoutId.unref(); // prevent leaks
		return { signal: abortController.signal, timeoutId };
	}
}

export default Nexios;
