import { NexiosHeaders } from './interfaces';
import NexiosError from './NexiosError';

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
