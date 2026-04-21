import { Wllama } from 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.7/esm/index.js';
import WasmFromCDN from 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.7/esm/wasm-from-cdn.js';

export class MyWallma {
	constructor(modelUrls, modelSettings) {
		this.interrupt_wllama = false;
		this.model_downloaded = false;
		this.model_urls = modelUrls;
		this.model_settings = modelSettings;
		this.is_generating = false;
		this.exited = false;

		this.llama_cpp_app = new Wllama(WasmFromCDN, {
			logger: {
				debug: (...args) => console.debug('wllama:', ...args),
				log: (...args) => console.log('wllama:', ...args),
				warn: (...args) => console.warn('wllama:', ...args),
				error: (...args) => console.error('wllama:', ...args),
			},
		});
	}

	cleanUp = async () => {
		if (this.exited) return;
		this.exited = true;
		this.interrupt_wllama = true;
		try {
			await this.llama_cpp_app.exit();
		} catch (err) {
			console.warn('wllama exit error (safe to ignore if not loaded):', err);
		}
	};

	downloadModel = async () => {
		document.body.classList.add('downloading');
		await this.llama_cpp_app.loadModelFromUrl(
			this.model_urls,
			this.model_settings
		);
		document.body.classList.remove('downloading');
		document.body.classList.remove('not-downloaded-yet');
	};

	interrupt = () => {
		this.interrupt_wllama = true;
	};

	infer = async (prompt) => {
		if (this.exited) return;
		const output_container_el = document.getElementById('output-container');
		if (typeof prompt !== 'string' || prompt.trim().length <= 2) {
			output_container_el.textContent = 'Please enter a longer prompt.';
			output_container_el.classList.add('show');
			return;
		}

		if (this.is_generating) return;
		this.is_generating = true;

		try {
			if (!this.model_downloaded) {
				await this.downloadModel();
				if (this.exited) return;
				this.model_downloaded = true;
			}

			output_container_el.textContent = 'Thinking…';
			output_container_el.classList.add('show');
			document.body.classList.add('running');

			const temperature_el = document.getElementById('temperature');
			const temperature = parseFloat(temperature_el.value);

			this.interrupt_wllama = false;

			await this.llama_cpp_app.createChatCompletion(
				[{ role: 'user', content: prompt }],
				{
					nPredict: 500,
					sampling: { temp: temperature, top_k: 40, top_p: 0.9 },
					onNewToken: (_token, _piece, currentText, { abortSignal }) => {
						if (this.interrupt_wllama) {
							abortSignal();
							return;
						}
						output_container_el.textContent = currentText;
					},
				}
			);
		} catch (err) {
			console.error('wllama inference error:', err);
			output_container_el.textContent =
				'Sorry, something went wrong running the model.';
		} finally {
			document.body.classList.remove('running');
			this.is_generating = false;
		}
	};
}

export const getModelSettings = ({
	n_ctx = 2048,
	n_seq_max = 1,
	n_batch = 512,
	cache_type_k = 'q4_0',
} = {}) => ({
	n_ctx,
	n_seq_max,
	n_batch,
	cache_type_k,
	progressCallback: (() => {
		let previous_download_percentage = 0;
		let previous_percentage_time = 0;
		return ({ loaded, total }) => {
			const progress_bar_container_el = document.getElementById(
				'progress-bar-container'
			);
			const progress_bar_el = document.getElementById('progress-bar');
			const time_remaining_el = document.getElementById('time-remaining');
			const output_container_el = document.getElementById('output-container');
			const progress_pct_el = document.getElementById('progress-pct');

			progress_bar_container_el.style.display = 'block';
			const ratio = total > 0 ? loaded / total : 0;
			progress_bar_el.value = ratio;
			if (progress_pct_el) {
				progress_pct_el.textContent = `${Math.round(ratio * 100)}%`;
			}

			if (total > 0 && loaded === total) {
				progress_bar_container_el.style.display = 'none';
				output_container_el.textContent = 'Warming up the model…';
				output_container_el.classList.add('show');
				previous_download_percentage = 0;
				previous_percentage_time = 0;
				return;
			}

			const percentage = Math.floor(ratio * 100);

			if (percentage > previous_download_percentage) {
				if (previous_percentage_time > 0) {
					const delta = Date.now() - previous_percentage_time;
					const percent_to_go = 100 - percentage;
					const time_remaining = (percent_to_go * delta) / 1000;

					let remaining_minutes = Math.floor(time_remaining / 60);
					let remaining_seconds = Math.round(time_remaining % 60);
					const ss =
						remaining_seconds < 10 ? '0' + remaining_seconds : remaining_seconds;
					let text = ss + 's left';
					if (remaining_minutes > 0) {
						text = remaining_minutes + 'm ' + text;
					}
					time_remaining_el.textContent = text;
				}
				previous_download_percentage = percentage;
				previous_percentage_time = Date.now();
			}
		};
	})(),
});
