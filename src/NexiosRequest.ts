import { NexiosConfig } from './interfaces';
import NexiosError from './NexiosError';
import { Params } from './types';

/** A data transfer object for generating the final url and init options for a fetch request. */
export default class NexiosRequest {
	url: string;
	config: NexiosConfig;

	get init() {
		return this.config;
	}

	constructor(config: NexiosConfig) {
		this.url = '';
		this.config = config;

		this.config.headers = new Headers(config.headers);

		if (config.data) config.body = JSON.stringify(config.data);

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
			token && this.config.headers?.set(xsrfHeaderName, token);
		}
	}

	private setURL(): void {
		const { baseURL, bypassBaseURL, url, params, paramsSerializer } = this.config;

		let urlObj;
		try {
			if (bypassBaseURL && url) urlObj = new URL(url);
			else if (baseURL) urlObj = new URL(baseURL + (url || ''));
			else throw new Error('No URL or baseURL provided.');

			// params
			const serializedParams = paramsSerializer
				? paramsSerializer(params)
				: this.serializeParams(params);

			urlObj.search = serializedParams;

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
			this.config.headers?.set(
				'Authorization',
				'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
			);
		}
	}

	private setCredentials() {
		if (this.config.withCredentials) this.config.credentials = 'include';
		else if (this.config.credentials === undefined) this.config.credentials = 'same-origin';
	}
}
