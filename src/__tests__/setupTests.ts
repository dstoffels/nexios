import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const baseURL = 'https://api.test.com';

export interface User {
	id: number;
	username: string;
	email: string;
}

export const users: User[] = [
	{ id: 1, username: 'userOne', email: 'userone@example.com' },
	{ id: 2, username: 'userTwo', email: 'usertwo@example.com' },
	{ id: 3, username: 'userThree', email: 'userthree@example.com' },
	{ id: 4, username: 'userFour', email: 'userfour@example.com' },
];

export const getUser = (userId: number | string) => {
	const user = users.find(({ id }) => id == userId);
	if (!user) throw new Error(`No user with id: ${userId}`);
	return user;
};

const server = setupServer(
	// get all
	http.get(`${baseURL}/users`, () => {
		return HttpResponse.json({
			usersList: users,
		});
	}),

	// post new
	http.post(`${baseURL}/users`, async ({ request }) => {
		try {
			const body = await request.json();
			users.push(body as User);
			return HttpResponse.json({ body }, { status: 201 });
		} catch (error) {
			return HttpResponse.json({ error }, { status: 400 });
		}
	}),
	http.put(`${baseURL}/users/:id`, async ({ request, params }) => {
		try {
			const { id } = params;
			if (!id) throw new Error('Path requires an id parameter');

			const user = getUser(id as string);

			const body = await request.json();
			users.push(body as User);
			return HttpResponse.json({ body }, { status: 200 });
		} catch (error) {
			return HttpResponse.json({ error }, { status: 400 });
		}
	}),
	http.patch(`${baseURL}/users/:id`, async ({ request }) => {
		try {
			const body = await request.json();
			users.push(body as User);
			return HttpResponse.json({ body }, { status: 200 });
		} catch (error) {
			return HttpResponse.json({ error }, { status: 400 });
		}
	}),
	http.delete(`${baseURL}/users/:id`, async ({ request }) => {
		try {
			const body = await request.json();
			users.push(body as User);
			return HttpResponse.json({ body }, { status: 204 });
		} catch (error) {
			return HttpResponse.json({ error }, { status: 400 });
		}
	}),
);

server.listen();
