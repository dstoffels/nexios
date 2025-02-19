import InterceptorManager from './interceptors';
import { NexiosConfig, NexiosOptions } from './interfaces';
import { NexiosHeaders } from './types';
import NexiosError from './NexiosError';
import NexiosRequest from './NexiosRequest';
import NexiosResponse from './NexiosResponse';
import NexiosCookies from './cookies';

// With default Axios Config (unimplemented features commented out)
export const defaultConfig: NexiosOptions = {
	method: 'GET',
	baseURL: '',
	bypassBaseURL: false,
	timeout: 1000,
	credentials: 'include',
	withCredentials: true,
	cache: 'force-cache',
	headers: {
		'content-type': 'application/json',
		accept: 'application/json',
	},
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
	cookies: NexiosCookies;

	interceptors: {
		request: InterceptorManager<NexiosConfig>;
		response: InterceptorManager<NexiosResponse>;
	};

	get baseURL() {
		return this.defaults.baseURL;
	}

	constructor(config?: NexiosOptions) {
		this.defaults = defaultConfig as NexiosConfig;
		if (config) this.defaults = this.mergeConfig(config);
		this.cookies = new NexiosCookies(this.defaults.headers);
		this.interceptors = {
			request: new InterceptorManager<NexiosConfig>(),
			response: new InterceptorManager<NexiosResponse>(),
		};
	}

	async request<T = any>(config: NexiosOptions): Promise<NexiosResponse<T>> {
		var mergedConfig = this.mergeConfig(config);
		try {
			// FINALIZE CONFIG
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

			// INTERCEPT ABORT ERROR
			if (error instanceof DOMException && error.name === 'AbortError') {
				const res = new NexiosResponse({ status: 408, ok: false } as Response, mergedConfig);
				const e = new NexiosError(`Request timed out after ${mergedConfig.timeout}ms`, res);
				throw e;
			}

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

	async get<T = any>(url: string, config?: NexiosOptions): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'GET' });
	}

	async post<T = any>(url: string, data: any, config?: NexiosOptions): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'POST', data });
	}

	async put<T = any>(url: string, data: any, config?: NexiosOptions): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'PUT', data });
	}

	async patch<T = any>(url: string, data: any, config?: NexiosOptions): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'PATCH', data });
	}

	async delete<T = any>(url: string, config?: NexiosOptions): Promise<NexiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'DELETE' });
	}

	setAuthHeader(token: string, isBearer: boolean = true) {
		// force object literal if defaults/headers are undefined.
		this.defaults.headers = this.defaults?.headers || {};
		this.defaults.headers['authorization'] = isBearer ? `Bearer ${token}` : token;
	}

	private async runRequestInterceptors(config: NexiosConfig): Promise<NexiosOptions> {
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

	private mergeConfig(config?: NexiosOptions): NexiosConfig {
		let output = { ...this.defaults };
		if (config) {
			let headers = { ...this.defaults.headers };
			if (config.headers) {
				headers = { ...headers, ...config.headers };
			}
			output = { ...output, ...config };
		}
		return output as NexiosConfig;
	}

	private startTimeout(timeout: number): { signal: AbortSignal; timeoutId: NodeJS.Timeout } {
		const abortController = new AbortController();
		const timeoutId = setTimeout(() => abortController.abort(), timeout);
		return { signal: abortController.signal, timeoutId };
	}
}

const nexios = new Nexios();

export default nexios;

export {
	Nexios,
	NexiosError,
	NexiosRequest,
	NexiosResponse,
	NexiosHeaders,
	NexiosConfig,
	NexiosOptions,
};
