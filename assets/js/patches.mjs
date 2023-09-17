export class Patches {
	constructor(patch, sim) {
		this.patch = patch;
		this.ScatterItemMenu = sim;
		this.ApplyPatches();
	}

	ApplyPatches() {
		this.PatchConstructEventMatcher();
		this.PatchRunTicks();
		this.PatchConsumeCosts();
		this.PatchPetPet();
		this.PatchComputeModifiers();
		this.PatchLoadLoreButtons();
		this.PatchRegisterItemData();
		this.PatchRegisterObject();
		this.PatchSetItem();
		this.PatchReadItemOnClick();
		this.PatchReadLore();
		this.PatchGetItemTooltipHTML();
		this.PatchSetItem();
		this.PatchGetMonsterSpawnTime();
	}

	PatchConstructEventMatcher() {
		this.patch(GameEventSystem, "constructMatcher").after((o, data) => {
			if (data.type == "ArchaeologyExcavationAction") {
				return new ArchaeologyActionEventMatcher(data, game);
			}
		});
	}

	PatchRunTicks() {
		this.patch(Game, "runTicks").replace(function(o, ticksToRun) {
			const startTimeStamp = performance.now();
			let ticksRan = 0;

			for (let i = 0; i < ticksToRun; i++) {
				if (ticksRan == 600) {
					this.archaeology.showNotifications = false;
				}

				this.tick();
				ticksRan++;
			}

			this.archaeology.showNotifications = true;

			if (ticksToRun > 72000) {
				const processingTime = performance.now() - startTimeStamp;

				console.log(`Took ${processingTime / 1000}s to process ${ticksToRun} ticks. ${processingTime / ticksToRun}ms per tick.`);
			}
		});
	}

	PatchConsumeCosts() {
		this.patch(Costs, "consumeCosts").replace(function(o) {
			if (this._gp > 0) {
				this.game.gp.remove(this._gp);
			}
		
			if (this._sc > 0) {
				this.game.slayerCoins.remove(this._sc);
			}
		
			if (this._raidCoins > 0) {
				this.game.raidCoins.remove(this._raidCoins);
			}
			this._items.forEach((quantity, item) => {
				if (quantity > 0) {
					let amount = quantity;
		
					if (item.type === "Archaeology Material") {
						if (game.minusNolldagArchaeology !== undefined) {
							if (game.minusNolldagArchaeology.isPoolTierActive(2)) {
								amount = Math.ceil(amount / 2);
		
								if (amount == 0) {
									amount == 1;
								}
							}
						}
					}
		
					this.game.bank.removeItemQuantity(item, quantity, true);
				}
			});
		});
	}

	PatchPetPet() {
		this.patch(PetManager, "petPet").replace(function(o, pet) {
			if (pet.id == "archaeology_skill:Digger") {
				imageNotify(pet.media, templateLangString("COMPLETION_LOG_PETS_Pet_Digger", {
					petName: pet.name
				}), "success");
			} else {
				imageNotify(pet.media, templateLangString("COMPLETION_LOG_PETS_Pet", {
					petName: pet.name
				}), "success");

				if (pet.id === "melvorD:CoolRock") {
					this.game.combat.player.pets++;
				}
			}
		});
	}

	PatchComputeModifiers() {
		this.patch(Player, "computeModifiers").after((o) => {
			game.minusNolldagArchaeology.currentRelicPowers.relics.forEach((relic) => {
				if (relic.modifiers !== undefined) {
					game.combat.player.modifiers.addModifiers(relic.modifiers);
				}
			});
		});
	}

	PatchLoadLoreButtons() {
		this.patch(Lore, "loadLoreButtons").after((o) => {
			const archaeologySkillModHeader = document.getElementById("archaeology-skill-lore-header");
			let lastArchaeologySkillMod = archaeologySkillModHeader;
		
			game.lore.books.forEach((book) => {
				if (book.namespace == "archaeology_skill") {
					const button = new LoreBookButtonElement();
		
					button.className = `col-12 p-2`;
					button.setImage(book);
					lastArchaeologySkillMod.after(button);
					lastArchaeologySkillMod = button;
					game.lore.bookButtons.set(book, button);
				}
			});
		});
	}

	PatchRegisterItemData() {
		this.patch(Game, "registerItemData").before((namespace, data) => {
			data.forEach((itemData) => {
				switch (itemData.itemType) {
					case "Ash":
						game.items.registerObject(new AshItem(namespace, itemData));

						break;
				}
			});
		});
	}

	PatchRegisterObject() {
		this.patch(ItemRegistry, "registerObject").after((o, object) => {
			if (game.items.ash === undefined) {
				game.items.ash = new NamespaceRegistry(game.registeredNamespaces);
			}

			if (object instanceof AshItem) {
				game.items.ash.registerObject(object);
			}
		});
	}

	PatchSetItem() {
		this.patch(BankSelectedItemMenu, "setItem").after((o, bankItem, bank) => {
			const item = bankItem.item;

			if (item instanceof AshItem) {
				if (game.minusNolldagArchaeology.scatterItemMenu === undefined) {
					game.minusNolldagArchaeology.scatterItemMenu = new this.ScatterItemMenu(bankSideBarMenu.selectedMenu.buryItemContainer);
				}

				game.minusNolldagArchaeology.scatterItemMenu.SetData(bankItem, item);
				game.minusNolldagArchaeology.scatterItemMenu.ShowContainer();
			} else {
				if (game.minusNolldagArchaeology.scatterItemMenu !== undefined) {
					game.minusNolldagArchaeology.scatterItemMenu.HideContainer();
				}
			}
		});
	}

	PatchReadItemOnClick() {
		this.patch(Bank, "readItemOnClick").after((o, item) => {
			if (game.currentGamemode.id !== "melvorF:Adventure") {
				if (item instanceof ReadableItem) {
					if (item.id == "archaeology_skill:Archaeology_New_Joiner") {
						document.getElementById("lore-Archaeology_New_Joiner-unlocked").classList.remove("d-none");
						game.minusNolldagArchaeology.readNewJoinersBook = true;
					}
				}
			}
		});
	}

	PatchReadLore() {
		this.patch(Lore, "readLore").after((o, book) => {
			if (game.currentGamemode.id !== "melvorF:Adventure") {
				if (book instanceof LoreBook) {
					if (book.id == "archaeology_skill:Archaeology_New_Joiner") {
						document.getElementById("lore-Archaeology_New_Joiner-unlocked").classList.remove("d-none");
						game.minusNolldagArchaeology.readNewJoinersBook = true;
					}
				}
			}
		});
	}

	PatchGetItemTooltipHTML() {
		this.patch(ItemCompletionElement, "getItemTooltipHTML").replace((o, item, game) => {
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
	}

	PatchSetItem() {
		this.patch(BankItemStatsMenu, "setItem").replace(function(o, bankItem, game) {
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

	PatchGetMonsterSpawnTime() {
		// This is temporary due to a bug with Player.getMonsterSpawnTime()
		this.patch(Player, "getMonsterSpawnTime").replace(function(o) {
			let spawnTime = this.baseSpawnInterval;

			spawnTime -= this.modifiers.decreasedMonsterRespawnTimer;
			spawnTime += this.modifiers.increasedMonsterRespawnTimer;

			if (spawnTime < 50) {
				spawnTime = 50;
			}

			console.log(spawnTime);

			return spawnTime;
		});
	}
}

export class ArchaeologyActionEventMatcher extends SkillActionEventMatcher {
	constructor(options, game) {
		super(options, game);

		if (options.actionIDs !== undefined) {
			this.actions = game.minusNolldagArchaeology.actions.getSetForConstructor(options.actionIDs, this, ExcavationHotspot.name);
		}
	}

	doesEventMatch(event) {
		return (event instanceof ArchaeologyActionEvent && (this.actions === undefined || isAnySetMemberInSet(this.actions, event.actions)) && super.doesEventMatch(event));
	}
}

export class AshItem extends Item {
	constructor(namespace, itemData) {
		super(namespace, itemData);
		this.prayerPoints = itemData.prayerPoints;
	}

	applyDataModification(modData, game) {
		super.applyDataModification(modData, game);
		
		if (modData.prayerPoints !== undefined) {
			this.prayerPoints = modData.prayerPoints;
		}
	}
}