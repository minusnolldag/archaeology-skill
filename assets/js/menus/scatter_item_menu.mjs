export class ScatterItemMenu {
	constructor(parent) {
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("scatter-item-template"));
		this.scatterItemContainer = getElementFromFragment(this._content, "scatter-item-container", "div");
		this.scatterItemPrayerPoints = getElementFromFragment(this._content, "scatter-item-prayer-points", "h5");
		this.scatterItemQuantitySlider = new BankRangeSlider(getElementFromFragment(this._content, "scatter-item-quantity-slider", "input"));
		this.scatterItemButton = getElementFromFragment(this._content, "scatter-item-button", "button");
		this.scatterItemTotalPoints = getElementFromFragment(this._content, "scatter-item-total-points", "h5");
		parent.after(this._content);
	}

	ShowContainer() {
		showElement(this.scatterItemContainer);
	}

	HideContainer() {
		hideElement(this.scatterItemContainer);
	}

	SetData(bankItem, item) {
		this.scatterItemPrayerPoints.textContent = templateLangString("MENU_TEXT_GRANTS_PRAYER_POINTS", {
			num: `${item.prayerPoints}`,
		});
		this.scatterItemButton.onclick = () => {
			this.ScatterItemOnClick(item, this.scatterItemQuantitySlider.quantity);
		};
		this.scatterItemQuantitySlider.setOnChange((newValue)=>{
			this.scatterItemTotalPoints.textContent = templateLangString("COMBAT_MISC_PRAYER_POINTS", {
				num: numberWithCommas(item.prayerPoints * newValue),
			});
		});
		this.scatterItemQuantitySlider.setSliderRange(bankItem);
		this.scatterItemQuantitySlider.setSliderPosition(bankItem.quantity);
	}

	ScatterItemOnClick(item, quantity) {
		if (!game.prayer.isUnlocked) {
			lockedSkillAlert(game.prayer, "SKILL_UNLOCK_BURY");

			return;
		}

		const bankItem = game.bank.items.get(item);

		if (bankItem === undefined) {
			return;
		}

		quantity = Math.min(bankItem.quantity, quantity);
		game.bank.removeItemQuantity(item, quantity, true);
		game.stats.Prayer.add(PrayerStats.AshesScattered, quantity);
		game.stats.Items.add(item, ItemStats.TimesScattered, quantity);
		game.combat.player.addPrayerPoints(item.prayerPoints * quantity);
		game.combat.player.render();
		notifyPlayer(game.prayer, templateLangString("MENU_TEXT_PRAYER_POINTS", {
			num: `+${numberWithCommas(item.prayerPoints * quantity)}`,
		}), "success");
	}
}