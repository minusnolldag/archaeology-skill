const { loadModule, patch } = mod.getContext(import.meta);
const { AshItem } = await loadModule("assets/js/items/ash_item.mjs");
const { ScatterItemMenu } = await loadModule("assets/js/menus/scatter_item_menu.mjs");

PatchItemData();
AddAshesScatteredToStatsPage();

async function PatchItemData() {
	patch(Game, "registerItemData").before((namespace, data) => {
		data.forEach((itemData) => {
			switch (itemData.itemType) {
				case "Ash":
					game.items.registerObject(new AshItem(namespace, itemData));

					break;
			}
		});
	});
	patch(ItemRegistry, "registerObject").after((o, object) => {
		if (game.items.ash === undefined) {
			game.items.ash = new NamespaceRegistry(game.registeredNamespaces);
		}

		if (object instanceof AshItem) {
			game.items.ash.registerObject(object);
		}
	});
	patch(BankSelectedItemMenu, "setItem").after((o, bankItem, bank) => {
		const item = bankItem.item;

		if (item instanceof AshItem) {
			if (game.archaeology.scatterItemMenu === undefined) {
				game.archaeology.scatterItemMenu = new ScatterItemMenu(bankSideBarMenu.selectedMenu.buryItemContainer);
			}

			game.archaeology.scatterItemMenu.SetData(bankItem, item);
			game.archaeology.scatterItemMenu.ShowContainer();
		} else {
			if (game.archaeology.scatterItemMenu !== undefined) {
				game.archaeology.scatterItemMenu.HideContainer();
			}
		}
	});
	patch(Bank, "readItemOnClick").after((o, item) => {
		if (item instanceof ReadableItem) {
			if (item.id == "archaeology_skill:Archaeology_New_Joiner") {
				game.archaeology.readNewJoinersBook = true;
			}
		}
	});
	patch(Lore, "readLore").after((o, book) => {
		if (book instanceof LoreBook) {
			if (book.id == "archaeology_skill:Archaeology_New_Joiner") {
				game.archaeology.readNewJoinersBook = true;
			}
		}
	});
	patch(ItemCompletionElement, "getItemTooltipHTML").replace((o, item, game) => {
		let itemTooltip = "";
		let ignoreCompletion = "";

		if (item.ignoreCompletion) {
			ignoreCompletion = `<br><span class="text-danger">${getLangString("STATISTICS_MISC_0")}</span>`;
		}

		let statDescription = getItemStatDescriptions(item, " <small class='text-warning'>", "<br>", "</small>");

		if (game.stats.itemFindCount(item) > 0) {
			if (item instanceof AshItem) {
				const timesScattered = game.stats.Items.getTracker(item).get(ItemStats.TimesScattered);

				if (timesScattered > 0) {
					statDescription += `<br>${getLangString("STATISTICS_ITEMS_TIMES_SCATTERED")} <small class="text-warning">${numberWithCommas(timesScattered)}</small>`;
				}
			}

			itemTooltip = `<div class='text-center'>${item.name}<small class='text-info'> ${statDescription}${ignoreCompletion}</small></div>`;
		} else if (!item.ignoreCompletion) {
			itemTooltip = `<div class="text-center text-danger">${item.name}</div>`;
		}

		return itemTooltip;
	});
	patch(BankItemStatsMenu, "setItem").replace(function(o, bankItem, game) {
		showElement(this.selectedItemContainer);
		const item = bankItem.item;
		this.itemName.textContent = item.name;
		this.itemDescription.innerHTML = item.description;

		if (item instanceof EquipmentItem) {
			showElement(this.viewStatsButton);
			this.viewStatsButton.onclick = () => viewItemStats(item);
		} else {
			hideElement(this.viewStatsButton);
		}

		this.itemImage.src = item.media;
		this.quantityBadge.textContent = numberWithCommas(bankItem.quantity);
		this.setItemLocked(bankItem.locked);
		this.itemLockButton.onclick = () => game.bank.toggleItemLock(bankItem);

		if (item instanceof FoodItem) {
			showElement(this.itemHealing);
			this.itemHealing.innerHTML = templateLangString("BANK_STRING_26", {
				hpImage: `<img class="skill-icon-xs mr-1" src="${cdnMedia("assets/media/skills/hitpoints/hitpoints.svg")}">`,
				hpValue: `<span class="text-bank-desc">${game.combat.player.getFoodHealing(item)}</span>`,
			});
		} else {
			hideElement(this.itemHealing);
		}

		this.statsContainer.textContent = "";

		const preStat = `<h5 class="font-w400 font-size-sm text-combat-smoke m-1 mb-2"><strong>`;
		const postStat = "</h5>";

		this.statsContainer.innerHTML = getItemStatDescriptions(item, " </strong>", preStat, postStat);

		if (bankItem.item instanceof AshItem) {
			const timesScattered = game.stats.Items.getTracker(bankItem.item).get(ItemStats.TimesScattered);

			if (timesScattered > 0) {
				this.statsContainer.innerHTML += `<h5 class="font-w400 font-size-sm text-combat-smoke m-1 mb-2"><strong>${getLangString("STATISTICS_ITEMS_TIMES_SCATTERED")} </strong>${numberWithCommas(timesScattered)}</h5>`
			}
		}
	});
}

function AddAshesScatteredToStatsPage() {
	let itemStatsLength = GetStatLength(ItemStats);
	let prayerStatsLength = GetStatLength(PrayerStats);

	ItemStats[ItemStats["TimesScattered"] = itemStatsLength] = "TimesScattered";
	PrayerStats[PrayerStats["AshesScattered"] = prayerStatsLength] = "AshesScattered";
	statsData.forEach((statData) => {
		if (statData.tableID == "prayer-stats-table") {
			statData.rows[statData.rows.length] = {
				get name() {
					return getLangString("STATISTICS_TOTAL_ASHES_SCATTERED");
				},
				get value() {
					return game.stats.Prayer.get(PrayerStats.AshesScattered);
				},
			};
		}
	});
}

function GetStatLength(stat) {
	let length = 0;

	Object.entries(stat).forEach(j => {
		const [key, value] = j;
	
		if (!isNaN(value)) {
			if (length <= value) {
				length = value + 1;
			}
		}
	});

	return length;
}