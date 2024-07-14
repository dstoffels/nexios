import { NexiosConfig, NexiosRequestConfig, NexiosResponse, NexiosResponseError } from './types';

class Nexios {
	private config: NexiosConfig = {
		baseUrl: '',
		defaultHeaders: {
			'Content-Type': 'application/json',
		},
		defaultErrorHandling: true,
	};

	constructor(config?: NexiosConfig) {
		this.config = { ...this.config, ...config };
	}

	async get<T = unknown>(
		url: string,
		config: NexiosRequestConfig = {},
	): Promise<NexiosResponse<T>> {
		return this.request<T>(url, { method: 'GET', ...config });
	}

	async post<T = unknown>(
		url: string,
		data: object,
		config: NexiosRequestConfig = {},
	): Promise<NexiosResponse<T>> {
		return this.request(url, { method: 'POST', body: JSON.stringify(data), ...config });
	}

	async put<T = unknown>(
		url: string,
		data: object,
		config: NexiosRequestConfig = {},
	): Promise<NexiosResponse<T>> {
		return this.request(url, { method: 'PUT', body: JSON.stringify(data), ...config });
	}

	async patch<T = unknown>(
		url: string,
		data: object,
		config: NexiosRequestConfig = {},
	): Promise<NexiosResponse<T>> {
		return this.request(url, { method: 'PATCH', body: JSON.stringify(data), ...config });
	}

	async delete<T = unknown>(
		url: string,
		config: NexiosRequestConfig = {},
	): Promise<NexiosResponse<T>> {
		return this.request(url, { method: 'DELETE', ...config });
	}

	async request<T = unknown>(
		url: string,
		options: NexiosRequestConfig = {},
	): Promise<NexiosResponse<T>> {
		url = `${this.baseUrl}${url}`;

		const response = await fetch(url, {
			...options,
			headers: {
				...this.config.defaultHeaders,
				...(options.headers || {}),
			},
		});

		if (!response.ok) {
			// throw new Error('ope');
			const error = await new NexiosResponseError(response).init();
			console.error(error.message);
			throw error;
		}

		return await new NexiosResponse<T>(response).init();
	}

	public get baseUrl() {
		return this.config.baseUrl;
	}

	static statusCodes: { [key: number]: string } = {
		100: 'CONTINUE',
		101: 'SWITCHING PROTOCOLS',
		200: 'OK',
		201: 'CREATED',
		202: 'ACCEPTED',
		203: 'NON-AUTHORITATIVE INFORMATION',
		204: 'NO CONTENT',
		205: 'RESET CONTENT',
		206: 'PARTIAL CONTENT',
		300: 'MULTIPLE CHOICES',
		301: 'MOVED PERMANENTLY',
		302: 'FOUND',
		303: 'SEE OTHER',
		304: 'NOT MODIFIED',
		305: 'USE PROXY',
		307: 'TEMPORARY REDIRECT',
		308: 'PERMANENT REDIRECT',
		400: 'BAD REQUEST',
		401: 'UNAUTHORIZED',
		402: 'PAYMENT REQUIRED',
		403: 'FORBIDDEN',
		404: 'NOT FOUND',
		405: 'METHOD NOT ALLOWED',
		406: 'NOT ACCEPTABLE',
		407: 'PROXY AUTHENTICATION REQUIRED',
		408: 'REQUEST TIMEOUT',
		409: 'CONFLICT',
		410: 'GONE',
		411: 'LENGTH REQUIRED',
		412: 'PRECONDITION FAILED',
		413: 'PAYLOAD TOO LARGE',
		414: 'URI TOO LONG',
		415: 'UNSUPPORTED MEDIA TYPE',
		416: 'RANGE NOT SATISFIABLE',
		417: 'EXPECTATION FAILED',
		426: 'UPGRADE REQUIRED',
		500: 'INTERNAL SERVER ERROR',
		501: 'NOT IMPLEMENTED',
		502: 'BAD GATEWAY',
		503: 'SERVICE UNAVAILABLE',
		504: 'GATEWAY TIMEOUT',
		505: 'HTTP VERSION NOT SUPPORTED',
	};
}

export default Nexios;
