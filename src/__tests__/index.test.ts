import Nexios from '../index';
import fetchMock from 'jest-fetch-mock';

describe('Nexios', () => {
	const mockBaseURL = 'https://api.example.com';
	let nexios: Nexios;

	beforeEach(() => {
		fetchMock.resetMocks();
		nexios = new Nexios({ baseUrl: mockBaseURL });
	});

	describe('ctor', () => {
		it('should initialize with default config', () => {
			const nexios = new Nexios();
			expect(nexios.baseUrl).toBe('');
		});

		it('should override default baseUrl', () => {
			const testUrl = 'https://test.com';
			const nexios = new Nexios({ baseUrl: testUrl });
			expect(nexios.baseUrl).toBe(testUrl);
		});
	});

	describe('HTTP Methods', () => {
		const mockResponse = { data: 'test' };
		const mockPath = '/users';
		const mockURL = `${mockBaseURL}${mockPath}`;

		beforeEach(() => {
			fetchMock.mockResponse(JSON.stringify(mockResponse));
		});

		it('should make GET request', async () => {
			const response = await nexios.get('/users');
			expect(fetchMock).toHaveBeenCalledWith(mockURL, expect.objectContaining({ method: 'GET' }));
			expect(response.data).toEqual(mockResponse);
		});

		it('should make POST request with data', async () => {
			const data = { username: 'Michael Scotch' };

			const response = await nexios.post(mockPath, data);
			expect(fetchMock).toHaveBeenCalledWith(
				mockURL,
				expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
			);

			expect(response.status).toBe(200);
		});
	});
});
