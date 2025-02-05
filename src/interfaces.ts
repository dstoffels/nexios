import NexiosError from './NexiosError';
import { RequestMimeType, RequestMethod, NexiosHeaders } from './types';

export interface NexiosOptions extends RequestInit {
	body?: any;
	method?: RequestMethod;
	params?: Record<string, string | number>;
	headers?: NexiosHeaders;
	timeout?: number;
}

export interface NexiosConfig {
	baseURL?: string;
	headers?: NexiosHeaders;
	credentials?: RequestCredentials;
	timeout?: number;
	cache?: RequestCache;
	parseError?: (error: NexiosError) => string;
}
