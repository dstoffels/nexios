import NexiosResponse from './NexiosResponse';

export default class NexiosError extends Error {
	response?: NexiosResponse;
	status?: number;
	statusMsg?: string;
	data?: any;
	isResponseError: boolean;

	constructor(message: string, response?: NexiosResponse) {
		super(message);
		this.name = 'NexiosError';
		this.response = response;
		this.isResponseError = Boolean(response);
		this.status = response?.status;
		this.statusMsg =
			this.status?.toString() && `${this.status} ${NexiosResponse.statusCodes[this.status]}`;
		this.data = response?.data;
	}
}
