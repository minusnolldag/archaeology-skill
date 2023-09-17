export class ArchaeologyArtisanMenu extends HTMLElement {
	constructor() {
		super();
		game.minusNolldagArchaeology.archaeologyArtisanMenu = this;
		this.skill = game.minusNolldagArchaeology;
		this.progressTimestamp = 0;
		this.progressInterval = 0;
		this.noneSelected = true;
		this.selectedRecipe = undefined;
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("archaeology-artisan-menu-template"));
		this.productImage = getElementFromFragment(this._content, "product-image", "img");
		this.productQuantity = getElementFromFragment(this._content, "produce-quantity", "small");
		this.productName = getElementFromFragment(this._content, "product-name", "span");
		this.productDescription = getElementFromFragment(this._content, "product-description", "small");
		this.noItemSelected = getElementFromFragment(this._content, "no-item-selected", "small");
		this.buffsIconContainer = getElementFromFragment(this._content, "buffs-icon-container", "div");
		this.productPreservation = new PreservationIcon(this.buffsIconContainer, 69);
		this.productDoubling = new DoublingIcon(this.buffsIconContainer, 69);
		this.itemRequirements = new RequiresBox(getElementFromFragment(this._content, "item-requirements", "div"), false, ["pb-2", "col-12"]);
		this.itemHaves = new HavesBox(getElementFromFragment(this._content, "item-haves", "div"), false, ["pb-2", "col-12"]);
		this.produces = new ProducesBox(getElementFromFragment(this._content, "produces-single", "div"), false, ["pb-2", "col-12"]);
		this.productIcon = new ItemQtyIcon(this.produces.iconContainer, false, 0);
		this.productIcon.hide();
		this.produces.addIcon(this.productIcon);
		this.grants = new GrantsBox(getElementFromFragment(this._content, "grants", "div"), false, ["pb-2", "col-12"]);
		const restoreRow = getElementFromFragment(this._content, "restore-row", "div");
		this.interval = new IntervalIcon(restoreRow, 0);
		this.restoreButton = getElementFromFragment(this._content, "restore-button", "button");
		this.progressBar = new ProgressBar(getElementFromFragment(this._content, "progress-bar", "div"), "bg-info");

		//this.mastery = new MasteryDisplay();
		//this.mastery.classList.add("mastery-6");

		this.productImage.src = game.minusNolldagArchaeology.media;
		this.grants.hideMastery();
	}

	connectedCallback() {
		this.appendChild(this._content);
	}

	localize() {
        /*this.createText.textContent = getLangString('MENU_TEXT_CREATE');
        if (this.product !== undefined) {
            this.productName.textContent = this.product.name;
            this.productDescription.textContent = '';
            if (this.product.hasDescription) {
                this.productDescription.append(...$.parseHTML(this.product.description));
            }
        }
        this.selectedText.textContent = getLangString('MENU_TEXT_NONE_SELECTED');
        this.viewStatsText.textContent = getLangString('MENU_TEXT_VIEW_STATS');
        this.requires.localize();
        this.haves.localize();
        this.produces.localize();
        this.grants.localize();
        this.createButton.textContent = getLangString('MENU_TEXT_CREATE');
        this.productDoubling.localize();
        this.productPreservation.localize();
        this.interval.localize();
        this.recipeDropdown.setButtonText(getLangString('MENU_TEXT_SELECT_RECIPE'));
        this.recipeDropdownItems.forEach((recipe)=>{
            recipe.forEach((icon)=>icon.localize());
        });*/
    }

	setCreateCallback(callback) {
		this.restoreButton.onclick = () => {
			callback(),
			this.restoreButton.blur();
		};
	}

	setSelected(recipe) {
		//if (this.noneSelected) {
			this.itemRequirements.setSelected();
			this.itemHaves.setSelected();
			this.grants.setSelected();
			this.produces.setSelected();
			hideElement(this.noItemSelected);
			this.productIcon.show();
			//this.noneSelected = false;
		//}
	}

	setIngredients(items, gp, sc) {
		this.itemRequirements.setItems(items, gp, sc);
		this.itemHaves.setItems(items, gp, sc);
	}

	animateProgressFromTimer(timer) {
		this.progressBar.animateProgressFromTimer(timer);
	}

	startProgressBar(interval) {
		this.progressBar.animateProgress(0, interval);
		this.progressInterval = interval;
		this.progressTimestamp = performance.now();
	}

	stopProgressBar() {
		this.progressBar.stopAnimation();
	}

	setProduct(item, qty) {
		this.product = item;
		this.productImage.src = item.media;
		this.productQuantity.textContent = numberWithCommas(game.bank.getQty(item.product));
		this.productName.textContent = item.name.replace("&apos;", "'");
		this.productDescription.innerHTML = "";

		if (item.hasDescription) {
			this.productDescription.innerHTML = item.description;
		}

		this.productIcon.setItem(item, qty);
	}

	updateQuantities() {
		this.itemHaves.updateQuantities();

		if (this.product !== undefined) {
			this.productQuantity.textContent = numberWithCommas(game.bank.getQty(this.product.product));
		}
	}

	updateGrants(xp, baseXP, masteryXP, baseMasteryXP, poolXP) {
		this.grants.updateGrants(xp, baseXP, 0, 0, 0);
		this.grants.hideMastery();
	}

	updateChances(preserveChance, doublingChance) {
		this.productPreservation.setChance(preserveChance);
		this.productDoubling.setChance(doublingChance);
	}

	updateInterval(interval) {
		this.interval.setInterval(interval);
	}
}
window.customElements.define("archaeology-artisan-menu", ArchaeologyArtisanMenu);