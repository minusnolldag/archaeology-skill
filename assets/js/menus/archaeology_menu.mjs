const { loadModule } = mod.getContext(import.meta);
const { ArchaeologyDigSiteMenu } = await loadModule("assets/js/menus/archaeology_dig_site_menu.mjs");

export class ArchaeologyMenu {
	constructor(archaeology) {
		this.archaeology = archaeology;
		this.digSites = new Map();
		this.digSitesContainer = document.getElementById("archaeology-area-container");
		this.archaeology.digSites.forEach((digSite) => {
			this.digSites.set(digSite, new ArchaeologyDigSiteMenu(digSite, this.archaeology, this.digSitesContainer));
		});
	}
}