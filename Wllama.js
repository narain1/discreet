import { Wllama } from './wllama/index.js';
import { clearCache } from './utils.js';

// You'll need to tell Wllama where some of it's files are
const CONFIG_PATHS = {
	'single-thread/wllama.js': './wllama/single-thread/wllama.js',
	'single-thread/wllama.wasm': './wllama/single-thread/wllama.wasm',
	'multi-thread/wllama.js': './wllama/multi-thread/wllama.js',
	'multi-thread/wllama.wasm': './wllama/multi-thread/wllama.wasm',
	'multi-thread/wllama.worker.mjs': './wllama/multi-thread/wllama.worker.mjs',
};

export class MyWallma {
	constructor(modelUrls, modelSettings) {
		this.interrupt_wllama = false;
		this.model_downloaded = false;
		this.model_urls = modelUrls;
		this.model_settings = modelSettings;

		// Here we showcase a more advanced example of how you can parse output from Llama.cpp:
		// A simpler version would be: window.llama_cpp_app = new Wllama(CONFIG_PATHS);
		this.llama_cpp_app = new Wllama(CONFIG_PATHS, {
			logger: {
				debug: (...args) => console.debug('🔧', ...args),
				log: (...args) => console.log('ℹ️', ...args),
				warn: (...args) => console.warn('⚠️', ...args),
				error: (...args) => console.error('☠️', ...args),
			},
		});
		console.log('new Wllama object created: ', this.llama_cpp_app);
	}

	cleanUp = async () => {
		await this.llama_cpp_app.exit();
	};

	downloadModel = async () => {
		console.log(
			'in download_model.  model_url,model_settings: ',
			this.model_urls,
			this.model_settings
		);
		document.body.classList.add('downloading');
		await clearCache();
		await this.llama_cpp_app.loadModelFromUrl(
			this.model_urls,
			this.model_settings
		);
		document.body.classList.remove('downloading');
		document.body.classList.remove('not-downloaded-yet');
	};

	interrupt = () => {
		console.log('Interrupting inference');
		console.log('in interrupt_wllama');
		this.interrupt_wllama = true;
	};

	infer = async (prompt) => {
		const output_container_el = document.getElementById('output-container');
		console.log('in infer. prompt: ', prompt);

		if (typeof prompt !== 'string' || prompt.length <= 4) {
			return alert('Please provide a (longer) prompt');
		}
		// The first time the model should be downloaded first
		if (this.model_downloaded === false) {
			await this.downloadModel();
			this.model_downloaded = true;
		}
		output_container_el.textContent = 'Generating Response';
		document.body.classList.add('running');

		prompt = `<start_of_turn>user ${prompt}<end_of_turn><start_of_turn>model`;

		//prompt = `<s>[INST]` + prompt +  `[/INST]</s>`
		try {
			let new_response_el = document.createElement('div');
			new_response_el.classList.add('llm-response');
			const temperature_el = document.getElementById('temperature');

			const temperature = parseFloat(temperature_el.value);
			const top_k = 40;
			const top_p = 0.9;

			await this.llama_cpp_app.createCompletion(prompt, {
				nPredict: 500,
				sampling: {
					temp: temperature,
					top_k, //40,
					top_p, //0.9,
				},
				onNewToken: (token, piece, currentText, { abortSignal }) => {
					if (this.interrupt_wllama) {
						console.log('sending interrupt signal to Wllama');
						abortSignal();
						this.interrupt_wllama = false;
					} else {
						console.log(
							'wllama: onNewToken:  token, piece, currentText:',
							token,
							piece,
							currentText
						);
						output_container_el.textContent = currentText;
					}
				},
			});

			document.body.classList.remove('running');
		} catch (err) {
			console.error('caught error running Wllama: ', err);
			alert('Sorry, an error occured');
			document.body.classList.remove('running');
		}
	};
}

export const getModelSettings = ({
	n_ctx = 2048,
	n_seq_max = 1,
	n_batch = 1024,
	cache_type_k = 'q4_0',
}) => ({
	n_ctx,
	n_seq_max,
	n_batch,
	cache_type_k,
	progressCallback: (() => {
		const output_container_el = document.getElementById('output-container');
		let previous_download_percentage = 0; // only for this demo
		let previous_percentage_time = 0; // only for this demo
		const progress_bar_el = document.getElementById('progress-bar');
		const time_remaining_el = document.getElementById('time-remaining');
		const progress_bar_container_el = document.getElementById(
			'progress-bar-container'
		);
		return ({ loaded, total }) => {
                        progress_bar_container_el.style.display = 'block';
			console.log(
				`Wllama: downloading... ${Math.round((loaded / total) * 100)}%`
			);
			progress_bar_el.value = loaded / total;
			if (loaded == total) {
				console.log('download complete');
				progress_bar_container_el.style.display = 'none';
				output_container_el.textContent = 'Warming up...';
				previous_download_percentage = 0;
				previous_percentage_time = 0;
			}

			const percentage = Math.floor((loaded / total) * 100);

			if (percentage > previous_download_percentage) {
				if (previous_percentage_time > 0) {
					const delta = Date.now() - previous_percentage_time;
					const percent_to_go = 100 - percentage;
					const time_remaining = (percent_to_go * delta) / 1000;

					let remaining_minutes = Math.floor(time_remaining / 60);
					let remaining_seconds = Math.round(time_remaining % 60);
					if (remaining_seconds < 10) {
						remaining_seconds = '0' + remaining_seconds;
					}
					let time_remaining_text = remaining_seconds + 's to go';
					if (remaining_minutes > 0) {
						time_remaining_text =
							remaining_minutes + 'm ' + time_remaining_text;
					}
					time_remaining_el.textContent = '⏳ ' + time_remaining_text;
				}

				previous_download_percentage = percentage;
				previous_percentage_time = Date.now();
			}
		};
	})(),
});
