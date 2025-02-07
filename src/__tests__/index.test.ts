import Nexios, { defaultConfig } from '../index';
import { baseURL } from './setupTests';
import { NexiosConfig, NexiosHeaders } from '../interfaces';
import NexiosError from '../NexiosError';
import NexiosRequest from '../NexiosRequest';

describe('Nexios', () => {
	let nexios: Nexios;

	// beforeEach(() => {
	// 	fetchMock.resetMocks();
	// 	nexios = new Nexios({ baseURL });
	// });

	// describe('ctor', () => {
	// 	it('should initialize with default config', () => {
	// 		const nexios = new Nexios();
	// 		expect(nexios.defaults).toEqual(defaultConfig);
	// 	});

	// 	it('should override default baseUrl', () => {
	// 		expect(nexios.baseURL).toBe(baseURL);
	// 	});
	// });

	// describe('HTTP Methods', () => {
	// 	const mockResponse = { data: 'test' };
	// 	let mockPath = '/users';
	// 	let mockURL = `${baseURL}${mockPath}`;
	// 	const headers: NexiosHeaders = { Authorization: 'Bearer TOKEN' } as NexiosHeaders;
	// 	const customConfig: NexiosConfig = { method: 'OPTIONS', headers };

	// 	beforeEach(() => {
	// 		fetchMock.mockResponse(JSON.stringify(mockResponse), {
	// 			headers: { 'Content-Type': 'application/json' },
	// 		});
	// 	});

	// 	it('should make a GET request with custom config', async () => {
	// 		const response = await nexios.get(mockPath, customConfig);

	// 		expect(fetchMock).toHaveBeenCalledWith(mockURL, expect.objectContaining({ method: 'GET' }));
	// 		expect(response.data).toEqual(mockResponse);
	// 	});

	// 	it('should make a custom GET request with query params', async () => {
	// 		const params = { type: 'broad', amount: '10' };

	// 		const response = await nexios.request({ url: mockPath, params, method: 'GET' });

	// 		const assembledUrl = new URL(mockURL);
	// 		Object.entries(params).forEach(([k, v]) => assembledUrl.searchParams.append(k, v.toString()));

	// 		expect(fetchMock).toHaveBeenCalledWith(
	// 			assembledUrl.toString(),
	// 			expect.objectContaining({ method: 'GET' }),
	// 		);
	// 		expect(response.data).toEqual(mockResponse);
	// 	});

	// 	const mockData = { username: 'Michael Scotch' };

	// 	it('should make a POST request with custom config', async () => {
	// 		const response = await nexios.post(mockPath, mockData, customConfig);
	// 		expect(fetchMock).toHaveBeenCalledWith(
	// 			mockURL,
	// 			expect.objectContaining({
	// 				...customConfig,
	// 				method: 'POST',
	// 				body: JSON.stringify(mockData),
	// 			}),
	// 		);
	// 		expect(response.data).toEqual(mockResponse);
	// 		expect(response.status).toBe(200);
	// 	});

	// 	mockPath += '/1';
	// 	mockURL += '/1';

	// 	it('should make a PUT request with custom config', async () => {
	// 		const response = await nexios.put(mockPath, mockData, customConfig);
	// 		expect(fetchMock).toHaveBeenCalledWith(
	// 			mockURL,
	// 			expect.objectContaining({ ...customConfig, body: JSON.stringify(mockData), method: 'PUT' }),
	// 		);
	// 		expect(response.data).toEqual(mockResponse);
	// 		expect(response.status).toBe(200);
	// 	});

	// 	it('should make a PATCH request with custom config', async () => {
	// 		const response = await nexios.patch(mockPath, mockData, customConfig);
	// 		expect(fetchMock).toHaveBeenCalledWith(
	// 			mockURL,
	// 			expect.objectContaining({
	// 				...customConfig,
	// 				body: JSON.stringify(mockData),
	// 				method: 'PATCH',
	// 			}),
	// 		);
	// 		expect(response.data).toEqual(mockResponse);
	// 		expect(response.status).toBe(200);
	// 	});

	// 	it('should make a DELETE request with custom config', async () => {
	// 		const response = await nexios.delete(mockPath, customConfig);
	// 		expect(fetchMock).toHaveBeenCalledWith(
	// 			mockURL,
	// 			expect.objectContaining({
	// 				...customConfig,
	// 				method: 'DELETE',
	// 			}),
	// 		);
	// 		expect(response.status).toBe(200);
	// 	});
	// });

	// describe('Error Handling', () => {
	// 	it('should throw NexiosError for non-200 responses', async () => {
	// 		// setup mock response
	// 		const errorResponse = { message: '404 NOT FOUND' };
	// 		fetchMock.mockResponseOnce(JSON.stringify(errorResponse), {
	// 			status: 404,
	// 			headers: { 'Content-Type': 'application/json' },
	// 		});

	// 		await expect(nexios.get('/nonexistent')).rejects.toThrow('404 NOT FOUND');
	// 	});

	// 	it('should include error data in thrown NexiosError', async () => {
	// 		// setup mock response
	// 		const errorResponse = {
	// 			message: 'Validation Error',
	// 			errors: ['Invalid input'],
	// 		};
	// 		fetchMock.mockResponseOnce(JSON.stringify(errorResponse), {
	// 			status: 400,
	// 			headers: { 'Content-Type': 'application/json' },
	// 		});

	// 		try {
	// 			await nexios.post('/users', {});
	// 		} catch (error) {
	// 			if (error instanceof NexiosError) {
	// 				expect(error.status).toBe(400);
	// 				expect(error.data).toEqual(errorResponse);
	// 			} else {
	// 				fail(error);
	// 			}
	// 		}
	// 	});
	// });
});
