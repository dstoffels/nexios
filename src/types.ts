export type CacheOptions =
	| 'default'
	| 'no-store'
	| 'reload'
	| 'no-cache'
	| 'force-cache'
	| 'only-if-cached';

export type CredentialsOptions = 'include' | 'same-origin' | 'omit';

export interface NexiosConfig {
	baseURL?: string;
	headers?: NexiosHeaders;
	credentials?: CredentialsOptions;
	timeout?: number;
	cache?: CacheOptions;
	parseError?: (error: NexiosError) => string;
}

export interface NexiosOptions {
	body?: any;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | (string & {});
	params?: Record<string, string | number>;
	headers?: NexiosHeaders;
	credentials?: CredentialsOptions;
	cache?: CacheOptions;
	timeout?: number;
}

export type ContentTypes =
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
	| (string & {});

export interface NexiosHeaders {
	Authorization?: string;
	Accept?: ContentTypes;
	'Content-Type'?: ContentTypes;
	'User-Agent'?: string;
}

export class NexiosResponse<T = unknown> extends Response {
	data: T | string | Blob | null = null;
	response: Response;

	constructor(response: Response) {
		super();
		Object.assign(this, response);
		this.response = response;
	}

	async tryResolveStream() {
		const contentType = this.headers.get('content-type') || '';

		try {
			if (contentType.includes('application/json')) {
				this.data = await this.response.json();
			} else if (contentType.includes('text')) {
				this.data = await this.response.text();
			} else {
				this.data = await this.response.blob();
			}
		} catch {
			this.data = null;
			return false;
		}
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

export class NexiosError extends Error {
	response: NexiosResponse;
	status: number;
	statusMsg: string;
	data: any;

	constructor(response: NexiosResponse) {
		super();
		this.response = response;
		this.status = response.status;
		this.statusMsg = `${this.status} ${NexiosResponse.statusCodes[this.status]}`;
		this.data = response.data;
	}
}
