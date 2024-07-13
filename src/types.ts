export interface NexiosRequestConfig {
	body?: any;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	headers?: NexiosRequestHeaders;
	params?: Record<string, string | number>;
	timeout?: number;
}

export interface NexiosResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: NexiosResponseHeaders;
}

export interface NexiosRequest<T> {
	url: string;
	data?: T;
	config?: NexiosRequestConfig;
	headers?: NexiosRequestHeaders;
}

export interface NexiosConfig {
	baseUrl?: string;
	defaultTimeout?: number;
	defaultHeaders?: NexiosRequestHeaders;
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
		| 'multipart/mixed';
	'User-Agent'?: string;
}

export interface NexiosResponseHeaders extends Headers {
	[key: string]: any;
	Server?: string;
	Date?: Date;
	'Content-Type'?: string;
	'Content-Length'?: number;
	Connection?: string;
	'Keep-Alive'?: string;
	Cookie?: string;
}

export class NexiosResponse<T = unknown> extends Response {
	data: T;
	headers: NexiosResponseHeaders;

	constructor(response: Response) {
		super();
		Object.assign(this, response);
		this.headers = this.parseHeaders(response.headers);
		this.data = {} as T;
		this.init(response);
	}

	private async init(response: Response): Promise<void> {
		this.data = await this.parseData(response);
	}

	private parseData(response: Response): Promise<T> {
		return response.json();
	}

	private parseHeaders(headers: Headers): NexiosResponseHeaders {
		const result: NexiosResponseHeaders = headers;
		headers.forEach((value, key) => (result[key] = value));
		return result;
	}
}
