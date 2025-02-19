import NexiosCookies from './cookies';
import { NexiosConfig, NexiosOptions } from './interfaces';
import NexiosError from './NexiosError';
import { Params } from './types';

/** A data transfer object for generating the final url and init options for a fetch request. */
export default class NexiosRequest {
	url: string;
	config: NexiosConfig;
	cookies: NexiosCookies;

	get init() {
		return this.config;
	}

	constructor(config: NexiosOptions) {
		this.url = '';
		if (config.data) config.body = JSON.stringify(config.data);
		this.config = { ...config, headers: config.headers || {} };
		this.cookies = new NexiosCookies(config.headers);

		this.setXSRFHeader();
		this.setBasicAuth();
		this.setCredentials();
		this.setURL();
	}

	serializeParams = (params?: Params): string => new URLSearchParams(params).toString();

	/** Client-side only */
	private setXSRFHeader(): void {
		const { xsrfCookieName, xsrfHeaderName } = this.config;
		if (typeof document !== 'undefined' && xsrfCookieName && xsrfHeaderName) {
			const cookieParts = `; ${document.cookie}`.split(`; ${xsrfCookieName}=`);
			const token = cookieParts.pop()?.split(';').shift();
			if (token) this.config.headers[xsrfHeaderName] = token;
		}
	}

	private setURL(): void {
		const { baseURL, bypassBaseURL, url, params, paramsSerializer } = this.config;

		let urlObj;
		try {
			if (bypassBaseURL && url) urlObj = new URL(url);
			else if (baseURL) urlObj = new URL(baseURL + (url || ''));
			else if (!baseURL && url) urlObj = new URL(url);
			else throw new Error('No URL or baseURL provided.');

			// params
			const serializedParams = paramsSerializer
				? paramsSerializer(params)
				: this.serializeParams(params);

			if (serializedParams) {
				if (urlObj.search) urlObj.search += '&' + serializedParams;
				else urlObj.search += '?' + serializedParams;
			}

			this.url = urlObj.toString();
		} catch (error) {
			if (error instanceof Error) throw new NexiosError(error.message);
			throw error;
		}
	}

	private setBasicAuth() {
		const { auth } = this.config;

		if (auth) {
			const { username, password } = auth;
			this.config.headers.authorization =
				'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
		}
	}

	private setCredentials() {
		if (this.config.withCredentials) this.config.credentials = 'include';
		else this.config.credentials = 'same-origin';
	}
}
