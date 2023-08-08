export class ArchaeologyDigSiteMenu {
	constructor(digSite, archaeology, parent) {
		this.digSite = digSite;
		this.archaeology = archaeology;
		this.selectedExcavationHotspot = undefined;
		this.excavationHotspotButtons = [];
		this.isHidden = false;
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("archaeology-dig-site-menu-template"));
		this.digSiteHeader = getElementFromFragment(this._content, "dig-site-header", "div");
		this.digSiteEyecon = getElementFromFragment(this._content, "dig-site-eyecon", "i");
		this.nameContainer = getElementFromFragment(this._content, "names-container", "div");
		this.infoContainer = getElementFromFragment(this._content, "info-container", "div");
		this.excavationHotspotButtonContainer = getElementFromFragment(this._content, "button-container", "div");
		this.digSiteName = getElementFromFragment(this._content, "dig-site-name", "span");
		this.excavationHotspotName = getElementFromFragment(this._content, "excavation-hotspot-name", "span");
		this.excavationHotspotInfoContainer = getElementFromFragment(this._content, "excavation-hotspot-info-container", "div");
		this.excavationHotspotHPProgressText = getElementFromFragment(this._content, "excavation-hotspot-hp-progress-text", "small");
		this.diggingProgress = new ProgressBar(getElementFromFragment(this._content, "digging-progress", "div"), "bg-danger");
		this.excavationHotspotHPProgress = new ProgressBar(getElementFromFragment(this._content, "excavation-hotspot-hp-progress", "div"), "bg-archaeology");
		this.excavationHotspotInterval = getElementFromFragment(this._content, "excavation-hotspot-interval", "span");
		this.masteryDisplay = getElementFromFragment(this._content, "archaeology-mastery", "mastery-display");

		const xpGrantsContainer = getElementFromFragment(this._content, "xp-grants-container", "div");
		const masteryGrantsContainer = getElementFromFragment(this._content, "mastery-grants-container", "div");

		this.digSiteEyecon.onclick = () => this.DigSitePanelClicked();

		this.xpSuccessIcon = new ArchaeologySuccessXPIcon(xpGrantsContainer, 0);
		this.xpFailureIcon = new ArchaeologyFailureXPIcon(xpGrantsContainer, 0);
		this.xpArtefactIcon = new ArchaeologyArtefactXPIcon(xpGrantsContainer, 0);
		this.masteryIcon = new MasteryXPIcon(masteryGrantsContainer, 0);
		this.masteryPoolIcon = new MasteryPoolIcon(masteryGrantsContainer, 0);

		this.startButton = getElementFromFragment(this._content, "start-button", "button");
		this.showDropsButton = getElementFromFragment(this._content, "show-drops-button", "button");
		this.startButton.textContent = getLangString("MENU_TEXT_Start_Digging");
		this.startButton.onclick = () => this.archaeology.StartStopExcavationHotspot(this);
		this.showDropsButton.onclick = () => this.ShowDrops();
		this.SetExcavationHotspotButtons();
		this.SetDigSiteName();
		parent.append(this._content);
	}

	SetExcavationHotspotButtons() {
		this.excavationHotspotButtonContainer.textContent = "";
		this.excavationHotspotButtons = [];
		this.digSite.excavationHotspots.forEach((excavationHotspot) => {
			this.excavationHotspotButtons.push(new ArchaeologyExcavationHotspotButtonMenu(excavationHotspot, this, this.archaeology, this.excavationHotspotButtonContainer));
		});
	}

	SetDigSiteName() {
		this.digSiteName.textContent = this.digSite.name.replace("&apos;", "'");
	}

	SetSelectedExcavationHotspot(excavationHotspot) {
		this.excavationHotspotName.textContent = excavationHotspot.name.replace("&apos;", "'");
		this.excavationHotspotInterval.textContent = templateLangString("MENU_TEXT_SECONDS_RANGE", {
			minTime: formatFixed(excavationHotspot.baseMinInterval / 1000, 2),
			maxTime: formatFixed(excavationHotspot.baseMaxInterval / 1000, 2),
		});
		this.SetStartButtonState(true);
		this.masteryDisplay.setMastery(this.archaeology, excavationHotspot);
		this.archaeology.updateMasteryDisplays(excavationHotspot);
		this.UpdateXPGrants(excavationHotspot);
		showElement(this.excavationHotspotInfoContainer);
		showElement(this.startButton);
		showElement(this.showDropsButton);
	}

	UpdateXPGrants(excavationHotspot) {
		const successXP = excavationHotspot.baseExperienceSuccess;
		const failureXP = excavationHotspot.baseExperienceFailure;
		const artefactXP = excavationHotspot.baseExperienceArtefact;
		const avgInterval = (excavationHotspot.baseMaxInterval + excavationHotspot.baseMinInterval) / 2;
		const masteryXP = this.archaeology.getMasteryXPToAddForAction(excavationHotspot, avgInterval);
		const baseMasteryXP = this.archaeology.getMasteryXPToAddToPool(masteryXP);
		const masteryPoolXP = this.archaeology.getBaseMasteryXPToAddForAction(excavationHotspot, avgInterval);

		this.xpSuccessIcon.setXP(successXP);
		this.xpFailureIcon.setXP(failureXP);
		this.xpArtefactIcon.setXP(artefactXP);
		this.masteryIcon.setXP(masteryXP, baseMasteryXP);
		this.masteryPoolIcon.setXP(masteryPoolXP);
	}

	UpdateHP() {
		if (this.selectedExcavationHotspot !== undefined) {
			let hpPercent = 0;

			if (this.selectedExcavationHotspot.currentHP != 0 && this.selectedExcavationHotspot.hitpoints != 0) {
				hpPercent = (this.selectedExcavationHotspot.currentHP / this.selectedExcavationHotspot.hitpoints) * 100;
			}

			this.excavationHotspotHPProgress.setFixedPosition(hpPercent);
			this.excavationHotspotHPProgressText.textContent = `${this.selectedExcavationHotspot.currentHP} / ${this.selectedExcavationHotspot.hitpoints}`;
		}
	}

	DigSitePanelClicked() {
		if (this.isHidden) {
			this.ShowDigSitePanel();
		} else {
			this.HideDigSitePanel();
		}
	}

	ShowDigSitePanel() {
		this.digSiteEyecon.classList.remove("fa-eye-slash");
		this.digSiteEyecon.classList.add("fa-eye");
		showElement(this.nameContainer);
		showElement(this.infoContainer);
		this.isHidden = false;
	}

	HideDigSitePanel() {
		this.digSiteEyecon.classList.remove("fa-eye");
		this.digSiteEyecon.classList.add("fa-eye-slash");
		hideElement(this.nameContainer);
		hideElement(this.infoContainer);
		this.isHidden = true;
	}

	SetUnselectedExcavationHotspot() {
		console.log(this.selectedExcavationHotspot);
	}

	SetStartButtonState(s) {
		if (s) {
			this.startButton.classList.replace("btn-danger", "btn-success");
			this.startButton.textContent = getLangString("MENU_TEXT_Start_Digging");
		} else {
			this.startButton.classList.replace("btn-success", "btn-danger");
			this.startButton.textContent = getLangString("MENU_TEXT_Stop_Digging");
		}
	}

	SetActionActive() {
		
	}

	ShowDrops() {
		SwalLocale.fire({
			title: this.selectedExcavationHotspot.name,
			html: this.GetExcavationHotspotDropsHTML(),
			imageUrl: this.selectedExcavationHotspot.media,
			imageWidth: 64,
			imageHeight: 64,
			imageAlt: this.selectedExcavationHotspot.name,
		});
	}

	GetExcavationHotspotDropsHTML() {
		let html = `<span class="text-dark">`;
		let soil = "";
		let material = "";
		let artefact = "";

		if (this.selectedExcavationHotspot.soil !== undefined) {
			soil = `${getLangString("MISC_STRING_Archaeology_Soil")}<br><img class="skill-icon-xs mr-2" src="${this.selectedExcavationHotspot.soil.media}">${this.selectedExcavationHotspot.soil.name}`;
		}

		if (this.selectedExcavationHotspot.materialDropTable.size > 0) {
			material = this.selectedExcavationHotspot.materialDropTable.sortedDropsArray.map((drop) => {
				let dropText = templateLangString("BANK_STRING_40", {
					qty: `${drop.maxQuantity}`,
					itemImage: `<img class="skill-icon-xs mr-2" src="${drop.item.media}">`,
					itemName: drop.item.name,
				});

				return dropText;
			}).join("<br>");
		}

		if (this.selectedExcavationHotspot.artefactDropTable.size > 0) {
			artefact = this.selectedExcavationHotspot.artefactDropTable.sortedDropsArray.map((drop) => {
				let dropText = templateLangString("BANK_STRING_40", {
					qty: `${drop.maxQuantity}`,
					itemImage: `<img class="skill-icon-xs mr-2" src="${drop.item.media}">`,
					itemName: drop.item.name,
				});

				return dropText;
			}).join("<br>");
		}

		if (soil !== "") {
			html += `${soil}`;
		}

		if (material !== "") {
			if (soil !== "") {
				html += "<br><br>";
			}

			html += `${getLangString("MISC_STRING_Archaeology_Material")}<br><small>${getLangString("MISC_STRING_9")}</small><br>${material}`;
		}

		if (artefact !== "") {
			if (material !== "") {
				html += "<br><br>";
			}

			html += `${getLangString("MISC_STRING_Archaeology_Artefact")}<br><small>${getLangString("MISC_STRING_9")}</small><br>${artefact}`;
		}

		html += "</span>";

		return html;
	}
}

export class ArchaeologyArtefactXPIcon extends XPIcon {
	constructor(parent, xp, size = 48) {
		super(parent, "bg-secondary", size);
		this.xp = xp;
	}

	getTooltipContent(xp) {
		return `<div class="text-center">${templateLangString("MENU_TEXT_TOOLTIP_SKILL_XP", {
			xp: `${xp}`,
		})}<br><small>${getLangString("MENU_TEXT_Artefact_XP")}</small></div>`;
	}
}

export class ArchaeologyFailureXPIcon extends XPIcon {
	constructor(parent, xp, size = 48) {
		super(parent, "bg-secondary", size);
		this.xp = xp;
	}

	getTooltipContent(xp) {
		return `<div class="text-center">${templateLangString("MENU_TEXT_TOOLTIP_SKILL_XP", {
			xp: `${xp}`,
		})}<br><small>${getLangString("MENU_TEXT_Failure_XP")}</small></div>`;
	}
}

export class ArchaeologySuccessXPIcon extends XPIcon {
	constructor(parent, xp, size = 48) {
		super(parent, "bg-secondary", size);
		this.xp = xp;
	}

	getTooltipContent(xp) {
		return `<div class="text-center">${templateLangString("MENU_TEXT_TOOLTIP_SKILL_XP", {
			xp: `${xp}`,
		})}<br><small>${getLangString("MENU_TEXT_Success_XP")}</small></div>`;
	}
}

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