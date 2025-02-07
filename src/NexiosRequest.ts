import { NexiosConfig } from './interfaces';
import { Params } from './types';

/** A data transfer object for generating the final url and init options for a fetch request. */
export default class NexiosRequest {
	config: NexiosConfig;
	url: string;
	get init() {
		return this.config;
	}

	constructor(config: NexiosConfig) {
		this.config = config;
		this.url = '';

		if (!config.headers) this.config.headers = new Headers();

		if (config.data) config.body = JSON.stringify(config.data);

		this.setXSRFHeader();
		this.setBasicAuth();

		this.setURL();
	}

	serializeParams = (params?: Params): string => new URLSearchParams(params).toString();

	/** Only runs client-side */
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

		const path = bypassBaseURL ? (url as string) : `${baseURL}${url}`;
		const urlObj = new URL(path);

		// params
		const serializedParams = paramsSerializer
			? paramsSerializer(params)
			: this.serializeParams(params);

		urlObj.search = serializedParams;

		this.url = urlObj.toString();
	}

	private setBasicAuth() {
		const { auth } = this.config;

		if (auth) {
			const { username, password } = auth;
			this.config.headers?.set(
				'Authorization',
				'Basic ' + Buffer.from(`${username}:${password}`).toString(),
			);
		}
	}
}
