import { MyWallma } from './Wllama.js';
import { models } from './data.js';

const promptEl = () => document.getElementById('prompt');
const submitBtn = () => document.getElementById('submit-button');
const interruptBtn = () => document.getElementById('interrupt-button');
const outputEl = () => document.getElementById('output-container');
const modelSelect = () => document.getElementById('model');

let currentWllama = null;
let currentListeners = null;
let switchToken = 0;

function detachListeners() {
	if (!currentListeners) return;
	submitBtn().removeEventListener('click', currentListeners.submit);
	interruptBtn().removeEventListener('click', currentListeners.interrupt);
	currentListeners = null;
}

function attachListeners(wllama) {
	const submit = () => wllama.infer(promptEl().value);
	const interrupt = () => wllama.interrupt();
	submitBtn().addEventListener('click', submit);
	interruptBtn().addEventListener('click', interrupt);
	currentListeners = { submit, interrupt };
}

async function switchModel(key) {
	const token = ++switchToken;
	detachListeners();

	if (currentWllama) {
		const old = currentWllama;
		currentWllama = null;
		await old.cleanUp();
	}
	if (token !== switchToken) return; // a newer switch superseded us

	outputEl().textContent = '';
	outputEl().classList.remove('show');
	document.body.classList.add('not-downloaded-yet');

	const entry = models[key] || models[1];
	currentWllama = new MyWallma(entry.modelUrls, entry.modelSettings);
	attachListeners(currentWllama);
}

function populateModels() {
	const select = modelSelect();
	select.innerHTML = '';
	Object.entries(models).forEach(([key, m]) => {
		const opt = document.createElement('option');
		opt.value = key;
		opt.textContent = `${m.label} · ~${m.sizeMB} MB`;
		select.appendChild(opt);
	});
}

function detectEmbed() {
	try {
		const isIframe = window.self !== window.top;
		const params = new URLSearchParams(window.location.search);
		if (isIframe || params.has('embed')) {
			document.body.classList.add('embedded');
		}
	} catch (_) {
		document.body.classList.add('embedded');
	}
}

detectEmbed();
populateModels();
switchModel(modelSelect().value);

modelSelect().addEventListener('change', function () {
	switchModel(this.value);
});
