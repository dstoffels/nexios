import Nexios from '..';
import { baseURL, server } from './setup';

describe('NexiosResponse', () => {
	const nexios = new Nexios({ baseURL });

	it('should resolve a json body', async () => {
		const response = await nexios.get('/response-test/json');
		expect(response.data).toEqual({ message: 'Hello, World!' });
		expect(await response.json()).toEqual(response.data);
	});

	it('should resolve an xml body', async () => {
		const response = await nexios.get('/response-test/xml');
		expect(response.data).toEqual('<message>Hello, World!</message>');
		expect(await response.text()).toEqual(response.data);
	});

	it('should resolve a text body', async () => {
		const response = await nexios.get('/response-test/text');
		expect(response.data).toBe('Hello, World!');
		expect(await response.text()).toEqual(response.data);
	});

	it('should resolve a formdata body', async () => {
		const response = await nexios.get('/response-test/formdata');
		expect(response.data).toBeInstanceOf(FormData);
		expect((response.data as FormData).get('key')).toBe('value');
		expect(await response.formData()).toEqual(response.data);
	});

	it('should resolve a blob body', async () => {
		const response = await nexios.get('/response-test/blob');
		expect(response.data).toBeInstanceOf(Blob);
		expect(await response.blob()).toEqual(response.data);
	});

	it('should resolve an arraybuffer body', async () => {
		const response = await nexios.get('/response-test/arraybuffer');
		expect(response.data).toBeInstanceOf(ArrayBuffer);
		expect(await response.arrayBuffer()).toEqual(response.data);
	});
});
