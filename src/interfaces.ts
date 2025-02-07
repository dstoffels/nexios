import { Agent } from 'http';
import { RequestMethod, NexiosHeaders, Params } from './types';
import NexiosResponse from './NexiosResponse';

export interface NexiosConfig extends RequestInit {
	// Nexios Config
	next?: {
		revalidate?: false | 0 | number;
		targs?: string[];
	};

	/** An override for the default Nexios Error transformer  */
	transformErrorMsg?: (response: NexiosResponse) => string;

	// Standard Axios Config (unimplemented features commented out)
	url?: string;
	method?: RequestMethod;
	baseURL?: string;
	// transformRequest?: Array<(data: any, headers: NexiosHeaders) => any>;
	// transformResponse?: Array<(data: any) => any>;
	headers?: NexiosHeaders;
	params?: Params;
	// paramsSerializer?: (params: Params) => string;
	// data?: any;
	timeout?: number;
	// withCredentials?: boolean;
	// auth?: {
	// 	username: string;
	// 	password: string;
	// };
	// responseType?: XMLHttpRequestResponseType;
	// responseEncoding?: string;
	// xsrfCookieName?: string;
	// xsrfHeaderName?: string;
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
	// signal?: AbortSignal;

	/** Tells Nexios to automatically decompress the response body. */
	// decompress?: boolean;
}

export interface Interceptor<T> {
	onFulfilled?: (value: T) => T | Promise<T>;
	onRejected?: (error: any) => any;
}
