import { Nexios } from '..';
import { NexiosConfig } from '../interfaces';
import NexiosResponse from '../NexiosResponse';
import { baseURL, clearEndpointListeners, interceptRequest } from './setup';

describe('Interceptors', () => {
	let nexios: Nexios;

	beforeEach(() => {
		nexios = new Nexios({ baseURL });
	});

	afterEach(() => {
		clearEndpointListeners();
	});

	const token = 'TEST_TOKEN';

	it('should intercept requests', async () => {
		function addToken(config: NexiosConfig) {
			config.headers.Authorization = 'Bearer ' + token;
			return config;
		}

		nexios.interceptors.request.use(addToken);

		interceptRequest((request) => {
			expect(request.headers?.get('Authorization')).toBe('Bearer ' + token);
		});

		await nexios.get('/users');
	});

	it('should intercept request rejections', async () => {
		let message = '';

		function badAddToken(config: NexiosConfig) {
			// @ts-ignore
			config.get('Authorization'); // should throw error
			return config;
		}

		async function onRejected(error: Error) {
			message = error.message; // handle error
			return error;
		}

		nexios.interceptors.request.use(badAddToken, onRejected);

		try {
			await nexios.get('/users');
		} catch (error) {
			expect(message).toBe('config.get is not a function');
		}
	});

	it('should intercept responses', async () => {
		let status = 0;

		function setStatus(response: NexiosResponse) {
			status = response.status;
			return response;
		}

		nexios.interceptors.response.use(setStatus);

		await nexios.get('/users');

		expect(status).toBe(200);
	});

	it('should intercept response rejections', async () => {
		let message = '';

		function badSetStatus(response: NexiosResponse) {
			// @ts-ignore
			response.get('status'); // should throw error
			return response;
		}

		async function onRejected(error: Error) {
			message = error.message; // handle error
			return error;
		}

		nexios.interceptors.response.use(badSetStatus, onRejected);

		try {
			await nexios.get('/users');
		} catch (error) {
			expect(message).toBe('response.get is not a function');
		}
	});

	it('should eject interceptors', async () => {
		function reqInterceptor(config: NexiosConfig) {
			return config;
		}

		function resInterceptor(response: NexiosResponse) {
			return response;
		}

		const reqInterceptorId = nexios.interceptors.request.use(reqInterceptor);
		expect(nexios.interceptors.request.size).toBe(1);

		const resInterceptorId = nexios.interceptors.response.use(resInterceptor);
		expect(nexios.interceptors.response.size).toBe(1);

		nexios.interceptors.request.eject(reqInterceptorId);
		expect(nexios.interceptors.request.size).toBe(0);

		nexios.interceptors.response.eject(resInterceptorId);
		expect(nexios.interceptors.response.size).toBe(0);
	});
});
