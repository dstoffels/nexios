import { RequestMethod, Params, ResponseContentType, NexiosHeaders } from './types';
import NexiosResponse from './NexiosResponse';

export interface NexiosOptions extends RequestInit {
	// Nexios Config
	/** Next.js options
	 * @param revalidate
	 * @param tags
	 */
	next?: {
		revalidate?: false | 0 | number;
		tags?: string[];
	};

	/** An override for the default Nexios Error transformer  */
	transformErrorMsg?: <T>(response: NexiosResponse<T>) => string;

	// Standard Axios Config (unimplemented features commented out)
	url?: string;
	method?: RequestMethod;
	baseURL?: string;
	bypassBaseURL?: boolean;
	// transformRequest?: Array<(data: any, headers: NexiosHeaders) => any>;
	// transformResponse?: Array<(data: any) => any>;
	headers?: NexiosHeaders;
	params?: Params;
	paramsSerializer?: (params?: Params) => string;
	data?: any;
	timeout?: number;
	/** Overrides credentials property with 'includes' when true */
	withCredentials?: boolean;
	auth?: {
		username: string;
		password: string;
	};
	responseType?: ResponseContentType;
	// responseEncoding?: ResponseEncoding;
	xsrfCookieName?: string;
	xsrfHeaderName?: string;
	// onUploadProgress?: (progressEvent: ProgressEvent) => void;
	// onDownloadProgress?: (progressEvent: ProgressEvent) => void;
	// maxContentLength?: number;
	// maxBodyLength?: number;
	// validateStatus?: (status: number) => boolean;
	// maxRedirects?: number;
	// socketPath?: string | null;
	// httpAgent?: Agent;
	// httpsAgent?: Agent;
	// proxy?: {
	// 	protocol?: string;
	// 	host?: string;
	// 	port?: number;
	// 	auth?: {
	// 		username: string;
	// 		password: string;
	// 	};
	// };
	signal?: AbortSignal | null;

	/** Tells Nexios to automatically decompress the response body. */
	// decompress?: boolean;
	[key: string]: any;
}

export interface NexiosConfig extends NexiosOptions {
	headers: NexiosHeaders;
}

export interface Interceptor<T> {
	onFulfilled?: (value: T) => T | Promise<T>;
	onRejected?: (error: any) => any;
}
