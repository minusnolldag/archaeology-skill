const { loadModule, patch } = mod.getContext(import.meta);
const { ArchaeologyActionEventMatcher } = await loadModule("assets/js/skill/action_event.mjs");

patch(Game, "constructEventMatcher").after((o, data) => {
	if (data.type == "ArchaeologyExcavationAction") {
		return new ArchaeologyActionEventMatcher(data, game);
	}
});