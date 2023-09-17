export class OnInterfaces {
	constructor(am, adsm, acm, ast, aom, rpim) {
		this.ArchaeologyMenu = am;
		this.ArchaeologyDigSiteMenu = adsm;
		this.ArchaeologyCollectionsMenu = acm;
		this.ArchaeologySelectionTab = ast;
		this.ArcanumObeliskMenu = aom;
		this.RelicPowerIconMenu = rpim;
	}

	OnInterfaceAvailable() {
		this.AddArchaeologySkillModLoreHeading();
		this.AddArchaeologyMenus();
	}

	AddArchaeologySkillModLoreHeading() {
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

	AddArchaeologyMenus() {
	ui.createStatic("#archaeology-skill-mod-modal-book", document.getElementById("page-container"));
	ui.createStatic("#archaeology-skill-mod-component", document.getElementById("main-container"));
		game.minusNolldagArchaeology.archaeologyMenus = new this.ArchaeologyMenu(game.minusNolldagArchaeology, this.ArchaeologyDigSiteMenu);
		game.minusNolldagArchaeology.archaeologyCollectionsMenu = new this.ArchaeologyCollectionsMenu(game.minusNolldagArchaeology);
		new CategoryMenu("archaeology-category-menu", "horizontal-navigation-archaeology", game.minusNolldagArchaeology.categories.allObjects, "SELECT_ARCHEOLOGY_CATEGORY", this.SwitchArchaeologyCategory);
		game.minusNolldagArchaeology.categories.forEach((category) => {
			if (category.id === "archaeology_skill:Dig_Sites" || category.id === "archaeology_skill:Collection" || category.id === "archaeology_skill:Arcanum_Obelisk") {
				return;
			}

			game.minusNolldagArchaeology.selectionTabs.set(category, new this.ArchaeologySelectionTab(category));
		});
		game.minusNolldagArchaeology.selectionTabs.forEach((selectionTab) => {
			selectionTab.localize();
		});
		game.minusNolldagArchaeology.arcanumObeliskMenu = new this.ArcanumObeliskMenu(document.getElementById("archaeology-arcanum-obelisk-container"), this.RelicPowerIconMenu);
	}

	SwitchArchaeologyCategory(category) {
		//console.log(ArchaeologyMenu);
		switch (category.id) {
			case "archaeology_skill:Workbench":
				game.minusNolldagArchaeology.renderQueue.selectionTabs = true;
				$("#archaeology-workbench-container").removeClass("d-none");
				$("#archaeology-area-container").addClass("d-none");
				$("#archaeology-collection-container").addClass("d-none");
				$("#archaeology-arcanum-obelisk-container").addClass("d-none");
				game.minusNolldagArchaeology.renderQueue.progressBar = true;
	
				break;
			case "archaeology_skill:Collection":
				$("#archaeology-collection-container").removeClass("d-none");
				$("#archaeology-area-container").addClass("d-none");
				$("#archaeology-workbench-container").addClass("d-none");
				$("#archaeology-arcanum-obelisk-container").addClass("d-none");
	
				break;
			case "archaeology_skill:Arcanum_Obelisk":
				game.minusNolldagArchaeology.arcanumObeliskMenu.UpdateCurrentRelicPoints()
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
				game.minusNolldagArchaeology.renderQueue.progressBar = true;
	
				break;
		}
	}
}