import { MyWallma } from './Wllama.js';
import { models } from './data.js';

import { clearCache } from './utils.js';

function getModel(modelUrls, modelSettings) {
	// Some elements on the page
	const prompt_el = document.getElementById('prompt');
	const wallma = new MyWallma(modelUrls, modelSettings);

	// Download button (removed to simplify the demo)

	const interrupt_button = document.getElementById('interrupt-button');
	const submit_button = document.getElementById('submit-button');

	const interuptCB = () => {
		wallma.interrupt();
	};

	const inferCB = () => {
		wallma.infer(prompt_el.value);
	};

	interrupt_button.addEventListener('click', interuptCB);
	submit_button.addEventListener('click', inferCB);

	const cleanUp = () => {
		wallma.cleanUp().catch(console.error);
		interrupt_button.removeEventListener('click', interuptCB);
		submit_button.removeEventListener('click', inferCB);
	};
	return cleanUp;
}

let cleanUpFunc = getModel(models[1].modelUrls, models[1].modelSettings);
document.getElementById('model').addEventListener('change', async function () {
	cleanUpFunc();

	cleanUpFunc = getModel(
		models[this.value].modelUrls,
		models[this.value].modelSettings
	);
	console.log(this.value);
});

//clear cache on page unload

// addEventListener('beforeunload', (event) => {
// 	clearCache();
// });

// Yes that's a 32K context model that we're loading.
