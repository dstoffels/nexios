export type NexiosHeaders = Record<string, string> & {
	accept?: ContentType;
	'content-length'?: ContentType;
	'user-agent'?: string;
	'content-encoding'?: ResponseEncoding;
	'content-type'?: ContentType;
	authorization?: string;
	cookie?: string | string[];
	'set-Cookie'?: string | string[];
};

export type RequestMethod =
	| 'get'
	| 'GET'
	| 'delete'
	| 'DELETE'
	| 'head'
	| 'HEAD'
	| 'options'
	| 'OPTIONS'
	| 'post'
	| 'POST'
	| 'put'
	| 'PUT'
	| 'patch'
	| 'PATCH'
	| 'purge'
	| 'PURGE'
	| 'link'
	| 'LINK'
	| 'unlink'
	| 'UNLINK'
	| (string & {});

export type ResponseContentType =
	| 'arraybuffer'
	| 'blob'
	| 'document'
	| 'json'
	| 'text'
	| 'stream'
	| 'formdata';

export type NexiosHeaderValue = string | string[] | number | boolean | null | undefined;

export type ContentType =
	| 'text/html'
	| 'text/plain'
	| 'text/xml'
	| 'multipart/form-data'
	| 'application/json'
	| 'application/x-www-form-urlencoded'
	| 'application/octet-stream'
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

export type ResponseEncoding =
	| 'ascii'
	| 'ASCII'
	| 'ansi'
	| 'ANSI'
	| 'binary'
	| 'BINARY'
	| 'base64'
	| 'BASE64'
	| 'base64url'
	| 'BASE64URL'
	| 'hex'
	| 'HEX'
	| 'latin1'
	| 'LATIN1'
	| 'ucs-2'
	| 'UCS-2'
	| 'ucs2'
	| 'UCS2'
	| 'utf-8'
	| 'UTF-8'
	| 'utf8'
	| 'UTF8'
	| 'utf16le'
	| 'UTF16LE';

export type Params = Record<string, string>;
