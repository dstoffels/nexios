import { Interceptor } from './interfaces';

export default class InterceptorManager<T> {
	private handlers: Array<Interceptor<T> | null> = [];

	get size(): number {
		let count = 0;
		this.handlers.forEach((h) => h && count++);
		return count;
	}

	use(onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: any) => any): number {
		this.handlers.push({
			onFulfilled,
			onRejected,
		});

		return this.handlers.length - 1;
	}

	eject(index: number): void {
		if (this.handlers[index]) this.handlers[index] = null;
	}

	foreach(callback: (h: Interceptor<T>) => void): void {
		this.handlers.forEach((h) => h && callback(h));
	}
}
