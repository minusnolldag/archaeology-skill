const { loadModule } = mod.getContext(import.meta);
const { RelicPowerIconMenu } = await loadModule("assets/js/menus/relic_power_icon_menu.mjs");

export class ArcanumObeliskMenu {
	constructor(parent) {
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("arcanum-obelisk-component"));
		this.obeliskImage = getElementFromFragment(this._content, "obelisk-image", "img");
		this.relic1 = getElementFromFragment(this._content, "relic-1", "div");
		this.relic1Image = getElementFromFragment(this._content, "relic-1-image", "img");
		this.relic2 = getElementFromFragment(this._content, "relic-2", "div");
		this.relic2Image = getElementFromFragment(this._content, "relic-2-image", "img");
		this.relic3 = getElementFromFragment(this._content, "relic-3", "div");
		this.relic3Image = getElementFromFragment(this._content, "relic-3-image", "img");
		this.currentRelicPowersEquipped = [
			{ div: this.relic1, image: this.relic1Image },
			{ div: this.relic2, image: this.relic2Image },
			{ div: this.relic3, image: this.relic3Image }
		];
		this.relicPoints = getElementFromFragment(this._content, "relic-points", "span");
		this.relicPointImage = getElementFromFragment(this._content, "relic-point-image", "img");
		this.relicPowerIconsContainer = getElementFromFragment(this._content, "relic-power-icons-container", "div");
		this.obeliskImage.src = game.archaeology.ObeliskImage;
		this.UpdateCurrentRelicPoints();
		this.relicPointImage.src = game.archaeology.RelicPointImage;
		this.relicPowerIconMenus = new Map();
		game.archaeology.arcanumObeliskRelics.forEach((relic) => {
			this.relicPowerIconMenus.set(relic, new RelicPowerIconMenu(relic, this.relicPowerIconsContainer));
		});
		parent.append(this._content);
	}

	UpdateCurrentRelicPoints() {
		this.relicPoints.textContent = templateLangString("YOU_HAVE_RELIC_POINTS_1", {
			points: `${game.archaeology.currentRelicPoints}`,
		});
	}

	UpdateCurrentRelicPowers() {
		let i = 0;

		game.archaeology.currentRelicPowers.relics.forEach((relic) => {
			if (relic._localID == "Empty_Arcanum_Obelisk_Relic") {
				this.currentRelicPowersEquipped[i].div.classList.add("d-none");
			} else {
				this.currentRelicPowersEquipped[i].div.classList.remove("d-none");
				
				// TODO Add a tooltip
				this.currentRelicPowersEquipped[i].div.onclick = () => game.archaeology.currentRelicPowers.UnequipRelic(relic);
			}

			this.currentRelicPowersEquipped[i].image.src = relic.media;
			i++;
		});
	}
}