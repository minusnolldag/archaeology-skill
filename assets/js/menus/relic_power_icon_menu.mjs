export class RelicPowerIconMenu {
	constructor(relic, parent) {
		this.relic = relic;
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("relic-power-icon-container"));
		this.iconContainer = getElementFromFragment(this._content, "icon-container", "div");
		this.link = getElementFromFragment(this._content, "link", "a");
		this.icon = getElementFromFragment(this._content, "icon", "img");
		this.lockIconContainer = getElementFromFragment(this._content, "lock-icon-container", "div");
		this.link.onclick = () => this.RelicPointClicked(this.relic);
		this.icon.src = relic.media;
		this.tooltip = this.CreateTooltip(this.link, this.CreateTooltipHTML(this.relic));
		parent.append(this._content);
	}

	RelicPointClicked(relic) {
		if (!relic.isUnlocked) {
			if (game.minusNolldagArchaeology.currentRelicPoints > 0) {
				game.minusNolldagArchaeology.UnlockRelic(relic);
				this.SetUnlocked();
			} else {
				notifyPlayer(game.minusNolldagArchaeology, getLangString("TOAST_NOT_ENOUGH_RELIC_POINTS"), "danger");
			}
		} else {
			if (game.minusNolldagArchaeology.currentRelicPowers.EquipRelic(relic)) {
				game.minusNolldagArchaeology.arcanumObeliskMenu.UpdateCurrentRelicPowers();
			}
		}
	}

	UpdateLockedState() {
		if (this.relic.isUnlocked) {
			this.SetUnlocked();
		}
	}

	SetLocked() {

	}

	SetUnlocked() {
		this.iconContainer.classList.remove("relic-icon-border-danger");
		this.lockIconContainer.classList.add("d-none");
	}

	CreateTooltip(parent, tooltipHTML) {
		return tippy(parent, {
			content: tooltipHTML,
			placement: "top",
			allowHTML: true,
			interactive: false,
			animation: false
		});
	}

	CreateTooltipHTML(relic) {
		return `<div class="text-center"><span class="text-warning">${relic.name}</span><br><small class="text-success">${getPlainModifierDescriptions(relic.modifiers).join("<br>")}</small></div>`;
	}
}