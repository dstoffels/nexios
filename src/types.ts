import Nexios from '.';

export interface NexiosConfig {
	baseUrl?: string;
	defaultTimeout?: number;
	defaultHeaders?: NexiosRequestHeaders;
	defaultErrorHandling?: boolean;
}

export interface NexiosRequestConfig {
	body?: any;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
	headers?: NexiosRequestHeaders;
	params?: Record<string, string | number>;
	timeout?: number;
}

export interface NexiosRequest<T> {
	url: string;
	data?: T;
	config?: NexiosRequestConfig;
	headers?: NexiosRequestHeaders;
}

export interface NexiosRequestHeaders {
	Accept?: string;
	Authorization?: string;
	'Content-Type'?:
		| 'text/plain'
		| 'text/html'
		| 'text/css'
		| 'text/javascript'
		| 'text/xml'
		| 'application/json'
		| 'application/xml'
		| 'application/javascript'
		| 'application/x-www-form-urlencoded'
		| 'application/octet-stream'
		| 'application/pdf'
		| 'application/zip'
		| 'image/jpeg'
		| 'image/png'
		| 'image/gif'
		| 'image/svg+xml'
		| 'audio/mpeg'
		| 'audio/wav'
		| 'video/mp4'
		| 'video/x-msvideo'
		| 'multipart/form-data'
		| 'multipart/alternative'
		| 'multipart/mixed'
		| string;
	'User-Agent'?: string;
}

export class NexiosResponse<T = unknown> extends Response {
	data: T = {} as T;

	constructor(response: Response) {
		super();
		Object.assign(this, response);
		this.init();
	}

	private async init() {
		if (this.ok) this.data = await this.json();
		return this;
	}
}

// EXCEPTIONS
export class NexiosResponseError extends Error {
	response: Response;
	status: number;
	statusMsg: string;
	data: any;
	name: string;
	message: string = '';

	constructor(response: Response) {
		super();
		this.name = 'NexiosError';
		this.response = response;
		this.status = response.status;
		this.statusMsg = `${this.status} ${Nexios.statusCodes[this.status]}`;
		this.init();
	}

	private async init() {
		this.data = await this.response.json();
		this.message = `${this.statusMsg}: ${this.data.message || this.data.error || this.data}`;
		return this;
	}
}
