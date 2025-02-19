import { Nexios } from '..';
import { baseURL, interceptRequest, server } from './setup';

describe('NexiosResponse', () => {
	const nexios = new Nexios({ baseURL });

	it('should resolve data as json', async () => {
		const response = await nexios.get('/response-test', {
			headers: { accept: 'application/json' },
		});
		expect(response.data).toEqual({ message: 'Hello, World!' });
		expect(await response.json()).toEqual(response.data);
	});

	it('should resolve data as text', async () => {
		const response = await nexios.get('/response-test', { headers: { accept: 'text/plain' } });
		expect(response.data).toBe('Hello, World!');
		expect(await response.text()).toEqual(response.data);
	});

	it('should resolve data as xml', async () => {
		const response = await nexios.get('/response-test', { headers: { accept: 'text/xml' } });
		expect(response.data).toEqual('<message>Hello, World!</message>');
		expect(await response.text()).toEqual(response.data);
	});

	it('should resolve data as html', async () => {
		const response = await nexios.get('/response-test', { headers: { accept: 'text/html' } });
		expect(response.data).toEqual('<h1>Hello, World!</h1>');
		expect(await response.text()).toEqual(response.data);
	});

	it('should resolve data as formdata', async () => {
		const response = await nexios.get('/response-test', {
			headers: { accept: 'multipart/form-data' },
		});
		expect(response.data).toBeInstanceOf(FormData);
		expect((response.data as FormData).get('key')).toBe('value');
		expect(await response.formData()).toEqual(response.data);
	});

	it('should resolve an arraybuffer', async () => {
		const response = await nexios.get('/response-test', {
			responseType: 'arraybuffer',
			headers: { accept: 'application/pdf' },
		});
		expect(response.data).toBeInstanceOf(ArrayBuffer);
		expect(await response.arrayBuffer()).toEqual(response.data);
	});

	it('should resolve data as a blob', async () => {
		const response = await nexios.get('/response-test', { headers: { accept: 'image/jpeg' } });
		expect(response.data).toBeInstanceOf(Blob);
		expect(await response.blob()).toEqual(response.data);
	});
});
