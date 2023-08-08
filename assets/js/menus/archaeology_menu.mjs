export class ArchaeologyMenu {
	constructor(archaeology, adsm) {
		this.ArchaeologyDigSiteMenu = adsm;
		this.archaeology = archaeology;
		this.digSites = new Map();
		this.digSitesContainer = document.getElementById("archaeology-area-container");
		this.archaeology.digSites.forEach((digSite) => {
			this.digSites.set(digSite, new this.ArchaeologyDigSiteMenu(digSite, this.archaeology, this.digSitesContainer));
		});
	}
}