const { loadData } = mod.getContext(import.meta);

loadData("assets/json/en.json").then((json) => {
	Object.entries(json).forEach(j => {
		const [key, value] = j;

		loadedLangJson[key] = value;
	});
});