import Nexios, { defaultConfig, defaultHeaders } from '../index';
import fetchMock from 'jest-fetch-mock';
import { NexiosError, NexiosOptions, NexiosHeaders } from '../types';

describe('Nexios', () => {
	const mockBaseURL = 'https://api.example.com';
	let nexios: Nexios;

	beforeEach(() => {
		fetchMock.resetMocks();
		nexios = new Nexios({ baseURL: mockBaseURL });
	});

	describe('ctor', () => {
		it('should initialize with default config', () => {
			const nexios = new Nexios();
			expect(nexios.baseURL).toBe('');
		});

		it('should override default baseUrl', () => {
			const testUrl = 'https://test.com';
			const nexios = new Nexios({ baseURL: testUrl });
			expect(nexios.baseURL).toBe(testUrl);
		});
	});

	describe('HTTP Methods', () => {
		const mockResponse = { data: 'test' };
		let mockPath = '/users';
		let mockURL = `${mockBaseURL}${mockPath}`;
		const headers: NexiosHeaders = { ...defaultHeaders, Authorization: 'Bearer TOKEN' };
		const customConfig: NexiosOptions = { ...defaultConfig, method: 'OPTIONS', headers };

		beforeEach(() => {
			fetchMock.mockResponse(JSON.stringify(mockResponse));
		});

		it('should make a GET request with custom config', async () => {
			const response = await nexios.get(mockPath, customConfig);

			expect(fetchMock).toHaveBeenCalledWith(
				mockURL,
				expect.objectContaining({ ...customConfig, method: 'GET' }),
			);
			expect(response.data).toEqual(mockResponse);
		});

		it('should make a custom GET request with query params', async () => {
			const params = { type: 'broad', amount: 10 };

			const response = await nexios.request(mockPath, { params, method: 'GET' });

			const assembledUrl = new URL(mockURL);
			Object.entries(params).forEach(([k, v]) => assembledUrl.searchParams.append(k, v.toString()));

			expect(fetchMock).toHaveBeenCalledWith(
				assembledUrl.toString(),
				expect.objectContaining({ method: 'GET' }),
			);
		});

		const mockData = { username: 'Michael Scotch' };

		it('should make a POST request with custom config', async () => {
			const response = await nexios.post(mockPath, mockData, customConfig);
			expect(fetchMock).toHaveBeenCalledWith(
				mockURL,
				expect.objectContaining({
					...customConfig,
					method: 'POST',
					body: JSON.stringify(mockData),
				}),
			);
			expect(response.data).toEqual(mockResponse);
			expect(response.status).toBe(200);
		});

		mockPath += '/1';
		mockURL += '/1';

		it('should make a PUT request with custom config', async () => {
			const response = await nexios.put(mockPath, mockData, customConfig);
			expect(fetchMock).toHaveBeenCalledWith(
				mockURL,
				expect.objectContaining({ ...customConfig, body: JSON.stringify(mockData), method: 'PUT' }),
			);
			expect(response.data).toEqual(mockResponse);
			expect(response.status).toBe(200);
		});

		it('should make a PATCH request with custom config', async () => {
			const response = await nexios.patch(mockPath, mockData, customConfig);
			expect(fetchMock).toHaveBeenCalledWith(
				mockURL,
				expect.objectContaining({
					...customConfig,
					body: JSON.stringify(mockData),
					method: 'PATCH',
				}),
			);
			expect(response.data).toEqual(mockResponse);
			expect(response.status).toBe(200);
		});

		it('should make a DELETE request with custom config', async () => {
			const response = await nexios.delete(mockPath, customConfig);
			expect(fetchMock).toHaveBeenCalledWith(
				mockURL,
				expect.objectContaining({
					...customConfig,
					method: 'DELETE',
				}),
			);
			expect(response.status).toBe(200);
		});
	});

	describe('Error Handling', () => {
		it('should throw NexiosError for non-200 responses', async () => {
			// setup mock response
			const errorResponse = { message: 'Not Found' };
			fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 404 });

			await expect(nexios.get('/nonexistent')).rejects.toThrow('404 NOT FOUND');
		});

		it('should include error data in thrown NexiosError', async () => {
			// setup mock response
			const errorResponse = {
				message: 'Validation Error',
				errors: ['Invalid input'],
			};
			fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 400 });

			try {
				await nexios.post('/users', {});
			} catch (error) {
				if (error instanceof NexiosError) {
					expect(error.status).toBe(400);
					expect(error.data).toEqual(errorResponse);
				} else {
					fail(error);
				}
			}
		});
	});
});
