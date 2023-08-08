export async function setup({ loadTemplates, loadStylesheet, loadModule, patch, onInterfaceAvailable, loadData, gameData }) {
	const archaeologyNamespace = game.registeredNamespaces.getNamespace("archaeology_skill");

	console.log("Loading Archaeology HTML Templates");
	await loadTemplates("assets/html/modal-book-archaeology-skill-mod.html");
	await loadTemplates("assets/html/archaeology_scatter_item_container.html");
	await loadTemplates("assets/html/archaeology_container.html");
	await loadTemplates("assets/html/archaeology_collections_container.html");
	await loadTemplates("assets/html/archaeology_dig_site_menu_template.html");
	await loadTemplates("assets/html/archaeology_excavation_hotspot_button_menu_template.html");
	await loadTemplates("assets/html/archaeology_artisan_menu.html");
	await loadTemplates("assets/html/arcanum_obelisk_component.html");
	await loadStylesheet("assets/css/style.css");

	console.log("Registering Archaeology Menus");
	const { ScatterItemMenu } = await loadModule("assets/js/menus/scatter_item_menu.mjs");
	const { ArchaeologyDigSiteMenu } = await loadModule("assets/js/menus/archaeology_dig_site_menu.mjs");
	const { ArchaeologyMenu } = await loadModule("assets/js/menus/archaeology_menu.mjs");
	const { ArchaeologyCollectionsMenu } = await loadModule("assets/js/menus/archaeology_collections_container.mjs");
	const { ArchaeologySelectionTab } = await loadModule("assets/js/menus/archaeology_selection_tab.mjs");
	const { RelicPowerIconMenu } = await loadModule("assets/js/menus/relic_power_icon_menu.mjs");
	const { ArcanumObeliskMenu } = await loadModule("assets/js/menus/arcanum_obelisk_menus.mjs");
	await loadModule("assets/js/menus/archaeology_artisan_menu.mjs");

	console.log("Registering Patches");
	const { Patches } = await loadModule("assets/js/patches.mjs");
	const patches = new Patches(patch, ScatterItemMenu);

	console.log("Registering Item Data");
	await loadModule("assets/js/items.mjs");

	console.log("Registering OnInterfaces");
	const { OnInterfaces } = await loadModule("assets/js/on_interfaces.mjs");
	const onInterfaces = new OnInterfaces(ArchaeologyMenu, ArchaeologyDigSiteMenu,  ArchaeologyCollectionsMenu, ArchaeologySelectionTab, ArcanumObeliskMenu, RelicPowerIconMenu);

	onInterfaceAvailable(async () => {
		onInterfaces.OnInterfaceAvailable();
	});

	console.log("Loading Archaeology Modules");
	const { ArchaeologyActionEvent } = await loadModule("assets/js/skill/action_event.mjs");
	const { ArcanumObeliskRelics } = await loadModule("assets/js/skill/arcanum_obelisk_relics.mjs");
	const { EquippedRelics } = await loadModule("assets/js/skill/equipped_relics.mjs");
	const { DigSites } = await loadModule("assets/js/skill/dig_sites.mjs");
	const { ExcavationHotspot } = await loadModule("assets/js/skill/excavation_hotspot.mjs");
	const { WorkbenchRecipe } = await loadModule("assets/js/skill/workbench_recipe.mjs");
	const { Collections } = await loadModule("assets/js/skill/collections.mjs");
	const { RenderQueue } = await loadModule("assets/js/skill/render_queue.mjs");
	const { Archaeology } = await loadModule("assets/js/archaeology.mjs");

	console.log("Registering Archaeology Skill");
	game.archaeology = await game.registerSkill(archaeologyNamespace, Archaeology);
	game.archaeology.LastConstructor(ArchaeologyActionEvent, ArcanumObeliskRelics, EquippedRelics, DigSites, ExcavationHotspot, WorkbenchRecipe, Collections, RenderQueue);

	console.log("Registering Archaeology Data");
	await gameData.addPackage("assets/json/data.json");

	console.log("Registering Archaeology Language Data");
	loadData("assets/json/en.json").then((json) => {
		Object.entries(json).forEach(j => {
			const [key, value] = j;
	
			loadedLangJson[key] = value;
		});
	});

	/*console.log("Registering Recipe Changes");
	await loadModule("assets/js/change_recipes.mjs");*/
};