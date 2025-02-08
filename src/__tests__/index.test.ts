import Nexios, { defaultConfig } from '../index';
import {
	baseURL,
	clearEndpointListeners,
	resetUsers,
	interceptRequest,
	User,
	users,
} from './setup';
import { NexiosConfig, NexiosHeaders } from '../interfaces';
import NexiosError from '../NexiosError';
import NexiosRequest from '../NexiosRequest';
import exp from 'constants';

describe('Nexios', () => {
	let nexios: Nexios;
	let mockPath = '';
	let mockURL = '';

	beforeEach(() => {
		nexios = new Nexios({ baseURL });
	});

	describe('ctor', () => {
		it('should initialize with default config', () => {
			const nexios = new Nexios();
			expect(nexios.defaults).toEqual(defaultConfig);
		});

		it('should override default baseUrl', () => {
			expect(nexios.baseURL).toBe(baseURL);
		});
	});

	describe('HTTP Methods', () => {
		beforeEach(() => {
			resetUsers();
			mockPath = '/users';
			mockURL = `${baseURL}${mockPath}`;
		});

		afterEach(() => {
			clearEndpointListeners();
		});

		const headers: NexiosHeaders = { Authorization: 'Bearer TOKEN' } as NexiosHeaders;
		const customConfig: NexiosConfig = { method: 'OPTIONS', headers };

		//////////////////////////// GET ///////////////////////////////////
		it('should make a GET request with custom config', async () => {
			const path = '/users';
			const url = baseURL + path;

			interceptRequest((request) => {
				expect(request.url).toBe(url);
				expect(request.method).toBe('GET');
				expect(request.headers.get('Authorization')).toBe('Bearer TOKEN');
			});

			const response = await nexios.get('/users', customConfig);
			expect(response.data).toEqual({ users });
		});

		it('should make a custom GET request with query params in headers', async () => {
			const params = { type: 'broad', amount: '10' };
			const assembledUrl = new URL(mockURL);
			assembledUrl.search = new URLSearchParams(params).toString();

			interceptRequest((request) => {
				expect(request.url).toBe(assembledUrl.toString());
				expect(request.method).toBe('GET');
				expect(request.headers.get('Authorization')).toBe('Bearer TOKEN');
			});

			const response = await nexios.request({
				...customConfig,
				url: mockPath,
				params,
				method: 'GET',
			});
			expect(response.status).toBe(200);
			expect(response.data).toEqual({ users });
		});

		//////////////////////////// POST ///////////////////////////////////
		it('should make a POST request with custom config', async () => {
			const newUser = { username: 'Michael Scotch', email: 'michael@scotch.com' };

			interceptRequest(async (request) => {
				expect(request.url).toBe(mockURL);
				expect(request.method).toBe('POST');
				expect(await request.json()).toEqual(newUser);
				expect(request.headers.get('Authorization')).toBe('Bearer TOKEN');
			});

			const response = await nexios.post(mockPath, newUser, customConfig);

			expect(response.status).toBe(201);
			expect(response.data).toEqual({ ...newUser, id: 5 });
		});
		it('should make a PUT request with custom config', async () => {
			mockPath += '/1';
			mockURL += '/1';
			const updatedUserData: User = { id: 1, username: 'Bob', email: 'Ross' };

			interceptRequest(async (request) => {
				expect(request.url).toBe(mockURL);
				expect(request.method).toBe('PUT');
				expect(await request.json()).toEqual(updatedUserData);
				expect(request.headers.get('Authorization')).toBe('Bearer TOKEN');
			});

			const response = await nexios.put(mockPath, updatedUserData, customConfig);

			expect(response.data).toEqual(updatedUserData);
			expect(response.status).toBe(200);
		});

		it('should make a PATCH request with custom config', async () => {
			mockPath += '/1';
			mockURL += '/1';
			const updateField = { email: 'test@test.com' };

			interceptRequest(async (request) => {
				expect(request.url).toBe(mockURL);
				expect(request.method).toBe('PATCH');
				expect(await request.json()).toEqual(updateField);
				expect(request.headers.get('Authorization')).toBe('Bearer TOKEN');
			});

			const response = await nexios.patch(mockPath, updateField, customConfig);
			expect(response.data).toEqual({
				id: 1,
				username: 'userOne',
				email: updateField.email,
			} as User);
			expect(response.status).toBe(200);
		});

		it('should make a DELETE request with custom config', async () => {
			mockPath += '/1';
			mockURL += '/1';
			const response = await nexios.delete(mockPath, customConfig);

			interceptRequest(async (request) => {
				expect(request.url).toBe(mockURL);
				expect(request.method).toBe('DELETE');
				expect(request.headers.get('Authorization')).toBe('Bearer TOKEN');
			});

			expect(response.status).toBe(204);
			expect(response.data).toBe(null);
		});
	});

	describe('Error Handling', () => {
		it('should timeout after 2 seconds', async () => {
			await expect(nexios.get('/timeout', { timeout: 2000 })).rejects.toThrow(
				'Request timed out after server failed to respond after 2000ms',
			);
		});

		it('should throw a NexiosError for 404 responses', async () => {
			try {
				await nexios.get('/nonexistent');
			} catch (error) {
				expect(error).toBeInstanceOf(NexiosError);
				if (error instanceof NexiosError) {
					expect(error.status).toBe(404);
					expect(error.statusMsg).toBe('404 NOT FOUND');
					expect(error.message).toBe('404 Not Found');
				}
			}
		});

		it('should throw a NexiosError for 500 responses', async () => {
			try {
				await nexios.get('/error');
			} catch (error) {
				expect(error).toBeInstanceOf(NexiosError);
				if (error instanceof NexiosError) {
					expect(error.status).toBe(500);
					expect(error.statusMsg).toBe('500 INTERNAL SERVER ERROR');
					expect(error.message).toBe('500 Internal Server Error');
				}
			}
		});
	});
});
