import NexiosResponse from './NexiosResponse';

export default class NexiosError extends Error {
	response: NexiosResponse;
	status: number;
	statusMsg: string;
	data: any;

	constructor(response: NexiosResponse, transformErrorMsg: (response: NexiosResponse) => string) {
		super();
		this.response = response;
		this.status = response.status;
		this.statusMsg = `${this.status} ${NexiosResponse.statusCodes[this.status]}`;
		this.data = response.data;
		this.message = transformErrorMsg(response) || this.statusMsg;
	}
}
