import { OutgoingHttpHeaders } from 'http2';

export type RequestMethod =
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'HEAD'
	| 'OPTIONS'
	| 'TRACE'
	| 'CONNECT'
	| (string & {});

export type RequestMimeType =
	| 'application/json'
	| 'application/x-www-form-urlencoded'
	| 'multipart/form-data'
	| 'text/plain'
	| 'text/html'
	| 'application/xml'
	| 'application/pdf'
	| 'image/png'
	| 'image/jpeg'
	| 'image/webp'
	| 'audio/mpeg'
	| 'audio/ogg'
	| 'video/mp4'
	| 'video/webm'
	| (string & {});

export type NexiosHeaders = Record<string, string> & {
	accept?: RequestMimeType;
	'accept-language'?: string;
	'accept-patch'?: string;
	'accept-ranges'?: string;
	'access-control-allow-credentials'?: string;
	'access-control-allow-headers'?: string;
	'access-control-allow-methods'?: string;
	'access-control-allow-origin'?: string;
	'access-control-expose-headers'?: string;
	'access-control-max-age'?: string;
	'access-control-request-headers'?: string;
	'access-control-request-method'?: string;
	age?: string;
	allow?: string;
	'alt-svc'?: string;
	authorization?: string;
	'cache-control'?: string;
	connection?: string;
	'content-disposition'?: string;
	'content-encoding'?: string;
	'content-language'?: string;
	'content-length'?: string;
	'content-location'?: string;
	'content-range'?: string;
	'content-type'?: RequestMimeType;
	cookie?: string;
	date?: string;
	etag?: string;
	expect?: string;
	expires?: string;
	forwarded?: string;
	from?: string;
	host?: string;
	'if-match'?: string;
	'if-modified-since'?: string;
	'if-none-match'?: string;
	'if-unmodified-since'?: string;
	'last-modified'?: string;
	location?: string;
	origin?: string;
	pragma?: string;
	'proxy-authenticate'?: string;
	'proxy-authorization'?: string;
	'public-key-pins'?: string;
	range?: string;
	referer?: string;
	'retry-after'?: string;
	'sec-websocket-accept'?: string;
	'sec-websocket-extensions'?: string;
	'sec-websocket-key'?: string;
	'sec-websocket-protocol'?: string;
	'sec-websocket-version'?: string;
	'set-cookie'?: string;
	'strict-transport-security'?: string;
	tk?: string;
	trailer?: string;
	'transfer-encoding'?: string;
	upgrade?: string;
	'user-agent'?: string;
	vary?: string;
	via?: string;
	warning?: string;
	'www-authenticate'?: string;
};

export type Params = Record<string, string | number>;
