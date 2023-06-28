const { patch } = mod.getContext(import.meta);

patch(Player, "computeModifiers").after((o) => {
	game.archaeology.currentRelicPowers.relics.forEach((relic) => {
		if (relic.modifiers !== undefined) {
			game.combat.player.modifiers.addModifiers(relic.modifiers);
		}
	});
});