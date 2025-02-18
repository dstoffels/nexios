import Nexios from './dist/index.js';

const nexios = new Nexios();

async function fetchData() {
	const url = 'https://danostoffels.me/cv/dan-stoffels-cv.pdf';

	try {
		const response = await nexios.get(
			`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&screenshot=true`,
		);

		// console.log(response.data);
	} catch (error) {
		console.log(error);
	}
}

fetchData();
