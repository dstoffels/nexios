import { setupServer } from 'msw/node';
import { http, HttpResponse, PathParams } from 'msw';

export const baseURL = 'https://api.test.com';

export interface User {
	id: number;
	username: string;
	email: string;
}

export let users: User[];

export function resetUsers() {
	users = [
		{ id: 1, username: 'userOne', email: 'userone@example.com' },
		{ id: 2, username: 'userTwo', email: 'usertwo@example.com' },
		{ id: 3, username: 'userThree', email: 'userthree@example.com' },
		{ id: 4, username: 'userFour', email: 'userfour@example.com' },
	];
}

const getIdParam = (params: PathParams) => {
	const { id } = params;
	if (!id) throw new Error('Path requires an id parameter');
	return id;
};

export const getUserIndex = (userId: number | string): number => {
	const i = users.findIndex(({ id }) => id == userId);
	if (i === -1) throw new Error(`No user with id: ${userId}`);
	return i;
};

const server = setupServer(
	// READ (all)

	http.get(`${baseURL}/users`, ({ request }) => {
		try {
			return HttpResponse.json({
				users,
			});
		} catch (error) {
			return HttpResponse.json({ error: (error as Error).message }, { status: 400 });
		}
	}),

	// CREATE
	http.post(`${baseURL}/users`, async ({ request }) => {
		try {
			const body = (await request.json()) as User;
			const newUser: User = { ...body, id: users[users.length - 1].id + 1 };
			users.push(newUser);
			return HttpResponse.json(newUser, { status: 201 });
		} catch (error) {
			return HttpResponse.json({ error: (error as Error).message }, { status: 500 });
		}
	}),

	// UPDATE
	http.put(`${baseURL}/users/:id`, async ({ request, params }) => {
		try {
			const id = getIdParam(params);
			let i = getUserIndex(id as string);
			const body = (await request.json()) as User;
			users[i] = body;
			return HttpResponse.json(body, { status: 200 });
		} catch (error) {
			return HttpResponse.json({ error: (error as Error).message }, { status: 400 });
		}
	}),

	// UPDATE
	http.patch(`${baseURL}/users/:id`, async ({ request, params }) => {
		try {
			const id = getIdParam(params);
			let i = getUserIndex(id as string);
			const body = (await request.json()) as User;
			const updatedUser = { ...users[i], ...body };
			users[i] = updatedUser;
			return HttpResponse.json(updatedUser, { status: 200 });
		} catch (error) {
			return HttpResponse.json({ error: (error as Error).message }, { status: 400 });
		}
	}),

	// DELETE
	http.delete(`${baseURL}/users/:id`, async ({ params }) => {
		try {
			const id = getIdParam(params);
			let i = getUserIndex(id as string);
			users.splice(i, 1);
			return new HttpResponse(null, { status: 204 });
		} catch (error) {
			return HttpResponse.json({ error: (error as Error).message }, { status: 400 });
		}
	}),
);

server.listen();

/** Passes a request clone to a test callback that's triggered when the server receives a request. */
export function interceptRequest(handler: (request: Request) => void) {
	server.events.on('request:start', ({ request }) => handler(request.clone()));
}

export function clearEndpointListeners() {
	server.events.removeAllListeners();
}
