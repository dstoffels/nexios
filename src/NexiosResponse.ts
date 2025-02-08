import { NexiosConfig } from './interfaces';
import NexiosError from './NexiosError';
import { ContentType } from './types';

export default class NexiosResponse<T = unknown> {
	data: T | null;
	config: NexiosConfig;
	raw: Response;

	status: number;
	statusText: string;
	headers: Headers;
	ok: boolean;
	redirected: boolean;
	type: ResponseType;
	url: string;
	body: ReadableStream<Uint8Array> | null;
	bodyUsed: boolean;

	constructor(response: Response, config: NexiosConfig) {
		this.data = null;
		this.config = config;
		this.raw = response;

		this.status = response.status;
		this.statusText = response.statusText;
		this.headers = new Headers(response.headers);
		this.ok = response.ok;
		this.redirected = response.redirected;
		this.type = response.type;
		this.url = response.url;
		this.body = response.body;
		this.bodyUsed = response.bodyUsed;
	}

	async resolveBody() {
		const contentType = this.headers.get('Content-Type') as ContentType;

		if (!contentType) return;

		try {
			const response = this.raw.clone();

			switch (true) {
				case contentType.startsWith('application/json'):
					this.data = (await response.json()) as T;
					break;
				case contentType.startsWith('application/x-www-form-urlencoded'):
				case contentType.startsWith('text/xml'):
				case contentType.startsWith('application/xml'):
				case contentType.startsWith('text/html'):
				case contentType.startsWith('text/plain'):
					this.data = (await response.text()) as T;
					break;
				case contentType.startsWith('multipart/form-data'):
					this.data = (await response.formData()) as T;
					break;
				case contentType.startsWith('application/octet-stream'):
					this.data = (await response.arrayBuffer()) as T;
					break;
				case contentType.startsWith('application/pdf'):
				case contentType.startsWith('image/jpeg'):
				case contentType.startsWith('image/png'):
				case contentType.startsWith('image/webp'):
				case contentType.startsWith('audio/mpeg'):
				case contentType.startsWith('audio/ogg'):
				case contentType.startsWith('video/mp4'):
				case contentType.startsWith('video/webm'):
					this.data = (await response.blob()) as T;
					break;
				default:
					this.data = null;
			}
		} catch (error) {
			throw new NexiosError((error as Error).message, this);
		}
	}

	async arrayBuffer(): Promise<ArrayBuffer> {
		return this.raw.arrayBuffer();
	}

	async blob(): Promise<Blob> {
		return this.raw.blob();
	}

	async formData(): Promise<FormData> {
		return this.raw.formData();
	}

	async json(): Promise<any> {
		return this.raw.json();
	}

	async text(): Promise<string> {
		return this.raw.text();
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
