import { CacheOptions, ContentTypes, CredentialsOptions } from './types';

export interface NexiosHeaders {
	Authorization?: string;
	Accept?: ContentTypes;
	'Content-Type'?: ContentTypes;
	'User-Agent'?: string;
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
