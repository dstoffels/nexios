import { Nexios } from '..';
import { baseURL, clearEndpointListeners, interceptRequest } from './setup';

describe('NexiosRequest', () => {
	let nexios: Nexios;
	beforeEach(() => {
		nexios = new Nexios({ baseURL });
	});

	afterEach(() => {
		clearEndpointListeners();
	});

	it('should set request url to baseURL', async () => {
		interceptRequest((request) => {
			expect(request.url).toBe(baseURL + '/');
		});

		await nexios.get('');
	});

	it('shoud set request url to baseURL + url', async () => {
		const url = '/users';
		interceptRequest((request) => {
			expect(request.url).toBe(baseURL + url);
		});

		await nexios.get(url);
	});

	it('should set request url to baseURL + url + params w params in config', async () => {
		const url = '/users';
		const params = { id: '1', name: 'John' };
		interceptRequest((request) => {
			expect(request.url).toBe(`${baseURL + url}?id=1&name=John`);
		});

		await nexios.get(url, { params });
	});

	it('should set request url to baseURL + url + params w params in url', async () => {
		const url = '/users?id=1&name=John';
		interceptRequest((request) => {
			expect(request.url).toBe(`${baseURL + url}`);
		});

		await nexios.get(url);
	});

	it('should set request url to url when bypassBaseURL is true', async () => {
		const url = 'https://otherapi.com/';
		interceptRequest((request) => {
			expect(request.url).toBe(url);
		});

		await nexios.get(url, { bypassBaseURL: true });
	});

	it('should set credentials to "include" when withCredentials is true', async () => {
		const config = { baseURL, withCredentials: true };

		interceptRequest((request) => {
			expect(request.credentials).toBe('include');
		});

		await nexios.get('/users', config);
	});

	it('should set credentials to "same-origin" when withCredentials is false', async () => {
		const config = { withCredentials: false };

		interceptRequest((request) => {
			expect(request.credentials).toBe('same-origin');
		});

		await nexios.get('/users', config);
	});

	it('should set basic auth header', async () => {
		const auth = { username: 'user', password: 'pass' };
		const config = { baseURL, auth };

		interceptRequest((request) => {
			expect(request.headers?.get('Authorization')).toBe(
				'Basic ' + Buffer.from(`${auth.username}:${auth.password}`).toString('base64'),
			);
		});

		await nexios.get('/users', config);
	});

	// ERROR HANDLING
	it('should throw NexiosError for invalid URLs', async () => {
		nexios = new Nexios();
		const url = 'abc';

		await expect(nexios.get(url, { bypassBaseURL: true })).rejects.toThrow('Invalid URL');
	});

	it('should throw NexiosError for missing baseURL', async () => {
		nexios = new Nexios();

		await expect(nexios.get('')).rejects.toThrow('No URL or baseURL provided.');
	});
});
