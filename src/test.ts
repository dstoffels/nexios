import Nexios from '.';

const nexios = new Nexios({ baseUrl: 'https://flicksdb.glitch.me' });

async function get() {
	const res = await nexios.post<{ api_key: string }>('/api/key', {
		email: 'danstoffels@devcodecamp.com',
	});

	console.log(res.data.api_key);
}

async function run() {
	await get();
}

run();
