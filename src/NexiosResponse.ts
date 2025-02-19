import NexiosCookies from './cookies';
import { NexiosOptions } from './interfaces';
import NexiosError from './NexiosError';
import { ContentType, NexiosHeaders, ResponseContentType } from './types';

export default class NexiosResponse<T = any> {
	data: T | null;
	config: NexiosOptions;
	raw: Response;

	status: number;
	statusText: string;
	headers: NexiosHeaders;
	cookies: NexiosCookies;
	ok: boolean;
	redirected: boolean;
	type: ResponseType;
	url: string;
	body: ReadableStream<Uint8Array> | null;
	bodyUsed: boolean;

	constructor(response: Response, config: NexiosOptions) {
		this.data = null;
		this.config = config;
		this.raw = response;

		this.status = response.status;
		this.statusText = response.statusText;
		this.headers = {};
		this.resolveHeaders(response.headers);
		this.cookies = new NexiosCookies(response.headers);
		this.ok = response.ok;
		this.redirected = response.redirected;
		this.type = response.type;
		this.url = response.url;
		this.body = response.body;
		this.bodyUsed = response.bodyUsed;
	}

	private resolveHeaders(headers: Headers): void {
		headers?.forEach((v, k) => (this.headers[k] = v));
	}

	async resolveBody() {
		if (this.status === 204) return;

		const responseTypeMap: Record<ResponseContentType, ContentType[]> = {
			json: ['application/json'],
			text: [
				'text/html',
				'text/plain',
				'application/xml',
				'text/xml',
				'application/x-www-form-urlencoded',
			],
			formdata: ['multipart/form-data'],
			blob: [
				'application/pdf',
				'image/jpeg',
				'image/png',
				'image/webp',
				'audio/mpeg',
				'audio/ogg',
				'video/mp4',
				'video/webm',
			],
			arraybuffer: ['application/pdf', 'application/octet-stream'],
			document: [],
			stream: ['application/octet-stream'],
		};

		try {
			const response = this.raw.clone();
			const responseType = this.config.responseType as ResponseContentType;

			const contentType = this.headers['content-type']?.toLowerCase();

			const normalizedResponseType: ResponseContentType =
				responseType === 'document'
					? 'text'
					: responseType === 'stream'
					? 'arraybuffer'
					: responseType;

			const validContentTypes = responseTypeMap[normalizedResponseType] || [];

			let resolveType: ResponseContentType = 'text';

			if (validContentTypes.some((ct) => contentType?.startsWith(ct)))
				resolveType = normalizedResponseType;
			else {
				resolveType = Object.entries(responseTypeMap).find(([, types]) =>
					types.some((t) => contentType?.startsWith(t)),
				)?.[0] as ResponseContentType;
			}
			switch (resolveType) {
				case 'json':
					this.data = (await response.json()) as T;
					break;
				case 'arraybuffer':
					this.data = (await response.arrayBuffer()) as T;
					break;
				case 'formdata':
					this.data = (await response.formData()) as T;
					break;
				case 'blob':
					this.data = (await response.blob()) as T;
					break;
				case 'text':
				default:
					this.data = (await response.text()) as T;
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
