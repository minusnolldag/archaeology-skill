const { patch } = mod.getContext(import.meta);

patch(SpecialAttack, "constructor").after((o) => {
	//console.log(o);
	//console.log(_name);

	//return o.replace("&apos;", "'");
});