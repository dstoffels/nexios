import { NexiosConfig, NexiosRequestConfig, NexiosResponse } from './types';

class Nexios {
	private config: NexiosConfig;

	constructor(config?: NexiosConfig) {
		this.config = config || {
			baseUrl: '',
			defaultHeaders: {
				'Content-Type': 'application/json',
			},
		};
	}

	async get(url: string, config: NexiosRequestConfig = {}) {
		return this.request(url, { method: 'GET', ...config });
	}

	async post(url: string, data: object, config: NexiosRequestConfig = {}) {
		return this.request(url, { method: 'POST', body: JSON.stringify(data), ...config });
	}

	async put(url: string, data: object, config: NexiosRequestConfig = {}) {
		return this.request(url, { method: 'PUT', body: JSON.stringify(data), ...config });
	}

	async patch(url: string, data: object, config: NexiosRequestConfig = {}) {
		return this.request(url, { method: 'PATCH', body: JSON.stringify(data), ...config });
	}

	async delete(url: string, config: NexiosRequestConfig = {}) {
		return this.request(url, { method: 'DELETE', ...config });
	}

	async request(url: string, options: NexiosRequestConfig = {}): Promise<NexiosResponse> {
		const response = await fetch(url, {
			...options,
			headers: {
				...this.config.defaultHeaders,
				...(options.headers || {}),
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return new NexiosResponse(response);
	}
}

export default Nexios;

const nexios = new Nexios();

async function get() {
	const res = await nexios.get('http');
}
