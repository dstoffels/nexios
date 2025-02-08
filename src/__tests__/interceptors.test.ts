import Nexios from '..';
import { baseURL, clearEndpointListeners } from './setup';

describe('Interceptors', () => {
	let nexios: Nexios;

	beforeEach(() => {
		nexios = new Nexios({ baseURL });
	});

	afterEach(() => {
		clearEndpointListeners();
	});

	it('should intercept requests', async () => {});
});
