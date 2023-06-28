export class ArchaeologyCollectionsMenu {
	constructor(archaeology) {
		this.archaeology = archaeology;
		this.archaeologyCollectionsMenuContainer = document.getElementById("archaeology-collection-container");
		this.collectionsList = new Map();
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("archaeology-collections-component"));
		this.collectionsContainer = getElementFromFragment(this._content, "collections-container", "div");
		this.selectedCollection = getElementFromFragment(this._content, "selected-collection", "div");
		this.archaeology.collections.forEach((collection) => {
			this.collectionsList.set(collection, {
				button: new ArchaeologyCollectionMenu(collection, this, this.archaeology, this.collectionsContainer),
				data: new ArchaeologySelectedCollectionMenu(collection, this.archaeology, this.selectedCollection)
			});
		});
		this.archaeologyCollectionsMenuContainer.append(this._content);
	}

	UpdateCollectionsContainerList() {
		this.collectionsList.forEach((collectionList) => {
			collectionList.button.SetCollectionProgress();
		});
	}

	SetSelectedCollection(collection) {
		this.collectionsList.forEach((collectionList) => {
			if (collectionList.data.collection == collection) {
				collectionList.data.ShowContainer();
			} else {
				collectionList.data.HideContainer();
			}
		});
	}
}

export class ArchaeologyCollectionMenu {
	constructor(collection, collectionsMenu, archaeology, parent) {
		this.collection = collection;
		this.collectionsMenu = collectionsMenu;
		this.archaeology = archaeology;
		this._content = new DocumentFragment()
		this._content.append(getTemplateNode("archaeology-collections-list-component"));
		this.link = getElementFromFragment(this._content, "link", "a");
		this.collectionName = getElementFromFragment(this._content, "collection-name", "div");
		this.collectionProgress = getElementFromFragment(this._content, "collection-progress", "div");
		this.link.onclick = () => this.collectionsMenu.SetSelectedCollection(this.collection);
		this.SetCollectionName();
		this.SetCollectionProgress();
		parent.append(this._content);
	}

	SetCollectionName() {
		this.collectionName.textContent = this.collection.name;
	}

	SetCollectionProgress() {
		let returnedCount = 0;

		this.collection.requiredItems.forEach((requiredItem) => {
			if (requiredItem.returned) {
				returnedCount++;
			}
		});
		this.collectionProgress.textContent = `${returnedCount} / ${this.collection.requiredItems.length}`;

		if (returnedCount == this.collection.requiredItems.length) {
			this.link.setAttribute("style", "background-color: #2D5223 !important;");
		}
	}
}

export class ArchaeologySelectedCollectionMenu {
	constructor(collection, archaeology, parent) {
		this.collection = collection;
		this.archaeology = archaeology;
		this._content = new DocumentFragment();
		this._content.append(getTemplateNode("selected-collection-component"));
		this.container = getElementFromFragment(this._content, "container", "div");
		this.archaeologySkillLogo = getElementFromFragment(this._content, "archaeology-skill-logo", "img");
		this.name = getElementFromFragment(this._content, "name", "h3");
		this.requiredItems = getElementFromFragment(this._content, "required-items", "ul");
		this.rewardCoins = getElementFromFragment(this._content, "reward-coins", "span");
		this.rewardXp = getElementFromFragment(this._content, "reward-xp", "span");
		this.relicPointImage = getElementFromFragment(this._content, "relic-point-image", "img");
		this.archaeologySkillLogo.src = this.archaeology.media;
		this.relicPointImage.src = this.archaeology.RelicPointImage;
		this.name.textContent = this.collection.name;
		this.requiredItemsList = new Map();
		this.collection.requiredItems.forEach((requiredItem) => {
			let item = requiredItem.item;
			let requiredItemContainer = createElement("li", {
				classList: ["pb-3"],
				parent: this.requiredItems
			});
			let selectedBox = createElement("div", {
				classList: ["collection-item-icon", "pointer-enabled", "m-2", "spell-not-selected"],
				parent: requiredItemContainer
			});
			let emptyDiv = createElement("div", {
				parent: selectedBox
			});
			let link = createElement("a", {
				parent: emptyDiv,
				attributes: [["role", "button"]]
			});
			let image = createElement("img", {
				classList: ["p-2"],
				parent: link,
				attributes: [["src", item.media]]
			});
			let amountContainer = createElement("div", {
				classList: ["font-size-sm", "text-white", "text-center", "mt-n2"],
				parent: link
			});
			let amountText = createElement("small", {
				classList: ["badge-pill", "bg-primary"],
				parent: amountContainer
			});

			this.requiredItemsList.set(requiredItem.item, selectedBox);
			selectedBox.onclick = () => this.GiveItem(selectedBox, requiredItem);
			amountText.textContent = "1";
			this.CreateTooltip(link, this.CreateTooltipHTML(requiredItem.item));
		});
		this.rewardCoins.textContent = `${numberWithCommas(this.collection.rewardGold)}`;
		this.rewardXp.textContent = `${numberWithCommas(this.collection.rewardXp)}`;
		this.CheckIfAllReturned();
		parent.append(this._content);
	}

	ShowContainer() {
		this.collection.requiredItems.forEach((requiredItem) => {
			if (requiredItem.returned) {
				this.requiredItemsList.get(requiredItem.item).classList.replace("spell-not-selected", "spell-selected");
			}
		});
		this.container.classList.remove("d-none");
	}

	HideContainer() {
		this.container.classList.add("d-none");
	}

	GiveItem(selectedBox, requiredItem) {
		if (selectedBox.classList.contains("spell-not-selected")) {
			if (game.bank.getQty(requiredItem.item) > 0) {
				game.bank.removeItemQuantity(requiredItem.item, 1, false);
				selectedBox.classList.replace("spell-not-selected", "spell-selected");
				requiredItem.returned = true;
				this.CheckIfAllReturned();
				game.archaeology.archaeologyCollectionsMenu.UpdateCollectionsContainerList();
			} else {
				notifyPlayer(game.archaeology, templateString(getLangString("TOAST_COLLECTION_REQUIRED_ITEM"), {
					name: this.collection.name
				}), "danger");
			}
		} else {
			notifyPlayer(game.archaeology, getLangString("TOAST_COLLECTION_ALREADY_RETURNED"), "danger");
		}
	}

	CheckIfAllReturned() {
		let allReturned = true;

		this.collection.requiredItems.forEach((ri) => {
			if (!ri.returned) {
				allReturned = false;
			}
		});

		if (allReturned) {
			if (!this.collection.rewardClaimed) {
				this.ClaimRewards();
			}
		}
	}

	ClaimRewards() {
		const rewards = new Rewards(game);

		if (this.collection.rewardGold > 0) {
			rewards.addGP(this.collection.rewardGold);
		}

		if (this.collection.rewardXp > 0) {
			rewards.addXP(game.archaeology, this.collection.rewardXp);
		}

		rewards.forceGiveRewards();
		game.archaeology.AddRelicPoint(1);
		game.archaeology.archaeologyCollectionsMenu.collectionsList.forEach((collectionMenu) => {
			if (collectionMenu.collection == this.collection) {
				collectionMenu.link.setAttribute("style", "background-color: #2D5223 !important;");
			}
		});
		this.collection.rewardClaimed = true;
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

	CreateTooltipHTML(item) {
		return `<div class="text-center"><span class="text-warning">${item.name}</span></div>`;
	}
}