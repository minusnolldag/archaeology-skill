export class ArchaeologyExcavationHotspotButtonMenu {
	constructor(excavationHotspot, digSite, archaeology, parent) {
		this.excavationHotspot = excavationHotspot;
		this.digSite = digSite;
		this.archaeology = archaeology;
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("archaeology-excavation-hotspot-button-menu-template"));
		this.excavationHotspotName = getElementFromFragment(this._content, "excavation-hotspot-name", "small");
		this.link = getElementFromFragment(this._content, "link", "a");
		parent.append(this._content);
	}

	SetExcavationHotspotName() {
		this.excavationHotspotName.textContent = this.excavationHotspot.name.replace("&apos;", "'");
	}

	SetExcavationHotspotUnlocked() {
		this.SetExcavationHotspotName();
		this.excavationHotspotName.classList.remove("text-danger");
		//this.link.onclick = () => this.archaeology.SelectExcavationHotspot(this.digSite, this.excavationHotspot);
		this.link.onclick = () => this.archaeology.selectRecipeOnClick(this.excavationHotspot);
	}

	SetExcavationHotspotLocked() {
		this.excavationHotspotName.classList.add("text-danger");
		this.excavationHotspotName.textContent = "";
		this.excavationHotspotName.append(...templateLangStringWithNodes("MENU_TEXT_UNLOCKED_AT", {
			skillImage: createElement("img", {
				classList: ["skill-icon-xs"],
				attributes: [["src", this.archaeology.media]]
			})
		}, {
			level: `${this.excavationHotspot.level}`
		}));
		this.link.onclick = null;
	}
}