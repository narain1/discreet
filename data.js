import { getModelSettings } from './Wllama.js';

// Chat template roles supported by Wllama's createChatCompletion
// Each model entry supplies: label, modelUrls (string or string[] for shards),
// sizeMB (rough, for UI hint), and modelSettings.
export const models = {
	1: {
		label: 'Qwen 2.5 · 0.5B',
		sizeMB: 380,
		modelUrls:
			'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
		modelSettings: getModelSettings({ n_ctx: 4096 }),
	},
	2: {
		label: 'Llama 3.2 · 1B',
		sizeMB: 808,
		modelUrls:
			'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
		modelSettings: getModelSettings({ n_ctx: 4096 }),
	},
	3: {
		label: 'Qwen 2.5 · 1.5B',
		sizeMB: 986,
		modelUrls:
			'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
		modelSettings: getModelSettings({ n_ctx: 4096 }),
	},
	4: {
		label: 'Gemma 2B',
		sizeMB: 1500,
		modelUrls: [
			'https://huggingface.co/narainp/gemma-2b-it-Q4_0-GGUF/resolve/main/gemma-2b-it-q4_0-00001-of-00006.gguf',
			'https://huggingface.co/narainp/gemma-2b-it-Q4_0-GGUF/resolve/main/gemma-2b-it-q4_0-00002-of-00006.gguf',
			'https://huggingface.co/narainp/gemma-2b-it-Q4_0-GGUF/resolve/main/gemma-2b-it-q4_0-00003-of-00006.gguf',
			'https://huggingface.co/narainp/gemma-2b-it-Q4_0-GGUF/resolve/main/gemma-2b-it-q4_0-00004-of-00006.gguf',
			'https://huggingface.co/narainp/gemma-2b-it-Q4_0-GGUF/resolve/main/gemma-2b-it-q4_0-00005-of-00006.gguf',
			'https://huggingface.co/narainp/gemma-2b-it-Q4_0-GGUF/resolve/main/gemma-2b-it-q4_0-00006-of-00006.gguf',
		],
		modelSettings: getModelSettings({}),
	},
	5: {
		label: 'Phi-3 mini · 3.8B',
		sizeMB: 2400,
		modelUrls: [
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00001-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00002-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00003-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00004-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00005-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00006-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00007-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00008-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00009-of-00010.gguf',
			'https://huggingface.co/narainp/Phi-3-mini-4k-instruct-Q4_K_M-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m-00010-of-00010.gguf',
		],
		modelSettings: getModelSettings({}),
	},
};
