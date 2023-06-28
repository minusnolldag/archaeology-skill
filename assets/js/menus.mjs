const { loadModule, onInterfaceAvailable } = mod.getContext(import.meta);
const { ArchaeologyMenu } = await loadModule("assets/js/menus/archaeology_menu.mjs");
const { ArchaeologyCollectionsMenu } = await loadModule("assets/js/menus/archaeology_collections_container.mjs");
const { ArchaeologySelectionTab } = await loadModule("assets/js/menus/archaeology_selection_tab.mjs");
const { ArcanumObeliskMenu } = await loadModule("assets/js/menus/arcanum_obelisk_menus.mjs");
await loadModule("assets/js/menus/archaeology_artisan_menu.mjs");

onInterfaceAvailable(async () => {
	ui.createStatic("#archaeology-skill-mod-modal-book", document.getElementById("page-container"));
	ui.createStatic("#archaeology-skill-mod-component", document.getElementById("main-container"));
		game.archaeology.archaeologyMenus = new ArchaeologyMenu(game.archaeology);
		game.archaeology.archaeologyCollectionsMenu = new ArchaeologyCollectionsMenu(game.archaeology);
		new CategoryMenu("archaeology-category-menu", "horizontal-navigation-archaeology", game.archaeology.categories.allObjects, "SELECT_ARCHEOLOGY_CATEGORY", SwitchArchaeologyCategory);
		game.archaeology.categories.forEach((category) => {
			if (category.id === "archaeology_skill:Dig_Sites" || category.id === "archaeology_skill:Collection" || category.id === "archaeology_skill:Arcanum_Obelisk") {
				return;
			}

			game.archaeology.selectionTabs.set(category, new ArchaeologySelectionTab(category));
		});
		game.archaeology.selectionTabs.forEach((selectionTab) => {
			selectionTab.localize();
		});
		game.archaeology.arcanumObeliskMenu = new ArcanumObeliskMenu(document.getElementById("archaeology-arcanum-obelisk-container"));
});

function SwitchArchaeologyCategory(category) {
	switch (category.id) {
		case "archaeology_skill:Workbench":
			game.archaeology.renderQueue.selectionTabs = true;
			$("#archaeology-workbench-container").removeClass("d-none");
			$("#archaeology-area-container").addClass("d-none");
			$("#archaeology-collection-container").addClass("d-none");
			$("#archaeology-arcanum-obelisk-container").addClass("d-none");
			game.archaeology.renderQueue.progressBar = true;

			break;
		case "archaeology_skill:Collection":
			$("#archaeology-collection-container").removeClass("d-none");
			$("#archaeology-area-container").addClass("d-none");
			$("#archaeology-workbench-container").addClass("d-none");
			$("#archaeology-arcanum-obelisk-container").addClass("d-none");

			break;
		case "archaeology_skill:Arcanum_Obelisk":
			game.archaeology.arcanumObeliskMenu.UpdateCurrentRelicPoints()
			$("#archaeology-arcanum-obelisk-container").removeClass("d-none");
			$("#archaeology-area-container").addClass("d-none");
			$("#archaeology-workbench-container").addClass("d-none");
			$("#archaeology-collection-container").addClass("d-none");

			break;
		case "archaeology_skill:Dig_Sites":
		default:
			$("#archaeology-area-container").removeClass("d-none");
			$("#archaeology-workbench-container").addClass("d-none");
			$("#archaeology-collection-container").addClass("d-none");
			$("#archaeology-arcanum-obelisk-container").addClass("d-none");
			game.archaeology.renderQueue.progressBar = true;

			break;
	}
}