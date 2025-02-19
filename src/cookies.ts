import NexiosError from './NexiosError';
import { NexiosHeaders } from './types';

/**
 * A cookie serializer for managing cookies as objects
 */
export default class NexiosCookies {
	private cookies: Record<string, Cookie>;

	constructor(headers?: Headers | NexiosHeaders) {
		this.cookies = {};

		if (headers) {
			if (!(headers instanceof Headers)) headers = new Headers(headers);

			const cookie = headers.get('cookie');
			cookie && this.parse(cookie);

			const setCookie = headers.getSetCookie();
			setCookie.length && this.parse(setCookie);
		}
	}

	set(name: string, value: string, options: CookieAttributes = {}) {
		if (name) {
			const cookie: Cookie = {
				name,
				value,
				...options,
			};
			this.cookies[name] = cookie;
		} else throw new NexiosError('Name cannot be empty');
	}

	/**
	 * @param name The cookie name
	 * @returns A Cookie object or undefined if name isn't found.
	 */
	get(name: string): Cookie | undefined {
		return this.cookies[name];
	}

	get all() {
		return Object.values(this.cookies);
	}

	forEach(callback: (cookie: Cookie, index: number, array: Cookie[]) => any) {
		this.all.forEach(callback);
	}

	delete(name: string): void {
		delete this.cookies[name];
	}

	getHeader(): string {
		return Object.values(this.cookies)
			.map((c) => {
				const { name, value, ...attributes } = c;
				let cookieStr = `${name}=${value}`;

				for (const [name, value] of Object.entries(attributes)) {
					if (value === true) cookieStr += `; ${name}`;
					else if (value) cookieStr += `; ${name}=${value}`;
				}

				return cookieStr;
			})
			.join('; ');
	}

	parse(rawCookie: string | string[]): void {
		const cookieParts = Array.isArray(rawCookie)
			? rawCookie.flatMap((sc) => sc.split(';'))
			: rawCookie.split(';');

		const attributeNames = [
			'Expires',
			'Max-Age',
			'Path',
			'Domain',
			'Secure',
			'HttpOnly',
			'SameSite',
			'Partitioned',
			'SameParty',
		];

		let newCookie: Cookie | undefined;
		let attributes: Record<string, any> = {};

		cookieParts.forEach((part) => {
			const [name, value] = part.trim().split('=');

			// if not an attribute, store current cookie, create new
			if (!attributeNames.includes(name)) {
				if (newCookie) this.set(newCookie.name, newCookie.value, attributes);

				// new cookie
				newCookie = {
					name,
					value,
				};

				// reset attributes
				attributes = {};
			} else {
				if (value === undefined) attributes[name] = true;
				else {
					const numVal = Number(value);
					attributes[name] = isNaN(numVal) ? value : numVal;
				}
			}
		});
		if (newCookie) this.set(newCookie.name, newCookie.value, attributes);
	}
}

export type CookieAttributes = {
	/** A date string to manually set the expiry time */
	readonly Expires?: string;
	/** Set the number of seconds until expiry */
	readonly 'Max-Age'?: number;
	/** The path for which the cookie is valid. default: "/" */
	readonly Path?: string;
	/** The domain for which the cookie is valid. */
	readonly Domain?: string;
	/** Cookie will only be sent over https if true */
	readonly Secure?: boolean;
	/** Cannot access cookie by JavaScript if true */
	readonly HttpOnly?: boolean;
	/** Controls whether cookies are sent with cross-origin requests */
	readonly SameSite?: 'Strict' | 'Lax' | 'None';
	/** If true, the cookie will only be sent in a first-party context */
	readonly Partitioned?: boolean;
	/** If true, the cookie will be sent only in first-party contexts */
	readonly SameParty?: boolean;
};

export type Cookie = {
	name: string;
	value: string;
} & CookieAttributes;

// const headers = new Headers({
// 	cookie:
// 		'sessionid=abc123xyz; Path=/; Secure; HttpOnly; SameSite=Strict; userId=789xyz; Path=/; Expires=Wed, 21 Oct 2025 07:28:00 GMT; Secure; HttpOnly; SameSite=Lax; theme=dark; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=None',
// });

// const mgr = new NexiosCookies(headers);

// mgr.set('access', 'assdsjdks833s', { Path: '/', Secure: true, 'Max-Age': 36000 });

// mgr.forEach((c) => console.log(c));

// const newHeader = mgr.getHeader();
// console.log(newHeader);
