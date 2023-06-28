export async function setup({ loadTemplates, loadStylesheet, loadModule, gameData, settings }) {
	console.log("Loading Archaeology HTML Templates");
	LoadHtmlAndCssData(loadTemplates, loadStylesheet);

	console.log("Registering Patch Data");
	await loadModule("assets/js/patch.mjs");

	console.log("Loading Archaeology Module");
	const { Archaeology } = await loadModule("assets/js/archaeology.mjs");

	console.log("Registering Archaeology Skill");
	game.archaeology = await game.registerSkill(game.registeredNamespaces.getNamespace("archaeology_skill"), Archaeology);

	console.log("Registering Item Data");
	await loadModule("assets/js/items.mjs");

	console.log("Registering Archaeology Data");
	await gameData.addPackage("assets/json/data.json");

	console.log("Registering Archaeology Language Data");
	await loadModule("assets/js/lang.mjs");

	console.log("Registering Archaeology Menus");
	await loadModule("assets/js/menus.mjs");

	// TESTING
	/*const generalSettings = settings.section("General");
	generalSettings.add({
		type: "button",
		name: "add-all-archaeology-items",
		display: "Add all Archaeology items",
		color: "primary",
  		onClick: function() {
			game.items.forEach((item) => {
				if (item.namespace == "archaeology_skill") {
					game.bank.addItemByID(item.id, 100, true, true, true);
				}
			});
		}
	});*/
};

async function LoadHtmlAndCssData(loadTemplates, loadStylesheet) {
	await loadTemplates("assets/html/modal-book-archaeology-skill-mod.html");
	await loadTemplates("assets/html/archaeology_scatter_item_container.html");
	await loadTemplates("assets/html/archaeology_container.html");
	await loadTemplates("assets/html/archaeology_collections_container.html");
	await loadTemplates("assets/html/archaeology_dig_site_menu_template.html");
	await loadTemplates("assets/html/archaeology_excavation_hotspot_button_menu_template.html");
	await loadTemplates("assets/html/archaeology_artisan_menu.html");
	await loadTemplates("assets/html/arcanum_obelisk_component.html");
	await loadStylesheet("assets/css/style.css");
}