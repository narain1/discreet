export const clearCache = async () => {
	await window.caches.keys().then((keys) => {
		keys.forEach((key) => {
			window.caches.delete(key);
		});
	});
};
