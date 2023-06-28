const { onInterfaceAvailable, patch } = mod.getContext(import.meta);

onInterfaceAvailable(async () => {
	AddArchaeologySkillModLoreHeading();
});
patch(Lore, "loadLoreButtons").after((o) => {
	const archaeologySkillModHeader = document.getElementById("archaeology-skill-lore-header");
	let lastArchaeologySkillMod = archaeologySkillModHeader;

	game.lore.books.forEach((book) => {
		if (book.namespace == "archaeology_skill") {
			const button = new LoreBookButtonElement();

			button.className = `col-12 p-2`;
			button.setImage(book);
			lastArchaeologySkillMod.after(button);
			lastArchaeologySkillMod = button;
			game.lore.bookButtons.set(book, button);
		}
	});
});

function AddArchaeologySkillModLoreHeading() {
	const container = document.getElementById("base-game-lore-header").parentElement;

	createElement("div", {
		id: "archaeology-skill-lore-header",
		classList: ["col-12", "p-2"],
		parent: container,
		children: [
			createElement("h4", {
				classList: ["text-uppercase", "text-left", "text-dark", "mb-1"],
				children: [
					createElement("span", {
						classList: ["font-w700"],
						text: "Archaeology Skill Mod"
					})
				]
			})
		]
	});
}