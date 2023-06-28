const { loadModule } = mod.getContext(import.meta);
const { ArchaeologyActionEvent } = await loadModule("assets/js/skill/action_event.mjs");
const { ArcanumObeliskRelics } = await loadModule("assets/js/skill/arcanum_obelisk_relics.mjs");
const { EquippedRelics } = await loadModule("assets/js/skill/equipped_relics.mjs");
const { DigSites } = await loadModule("assets/js/skill/dig_sites.mjs");
const { ExcavationHotspot } = await loadModule("assets/js/skill/excavation_hotspot.mjs");
const { WorkbenchRecipe } = await loadModule("assets/js/skill/workbench_recipe.mjs");
const { Collections } = await loadModule("assets/js/skill/collections.mjs");
const { RenderQueue } = await loadModule("assets/js/skill/render_queue.mjs");

export class Archaeology extends ArtisanSkill {
	constructor(namespace, game) {
		super(namespace, "Archaeology", game);
		this.emptyArcanumObeliskRelic = new ArcanumObeliskRelics(game.registeredNamespaces.getNamespace("archaeology_skill"), {
			"id": "Empty_Arcanum_Obelisk_Relic",
			"name": "",
			"media": "assets/img/question.svg",
			"modifiers": {}
		});
		this._media = "assets/img/archaeology_skill_logo.png";
		this.baseMasteryXP = 0;
		this.baseFailExcavationChance = 30;
		this.baseDoubleSoilChance = 0;
		this.baseMaterialCost = 100;
		this.baseFindArtefactChance = 50;
		this.baseFindMaterialChance = 80;
		this.baseExcavationInterval = 1000;
		this.renderQueue = new RenderQueue();
		this.showNotifications = true;
		this.readNewJoinersBook = false;
		this.foundFirstArtefact = false;
		this.currentRelicPoints = 0;
		this.currentRelicPowers = new EquippedRelics(3, this);
		this.activeExcavationHotspot = undefined;
		this.digSites = new NamespaceRegistry(game.registeredNamespaces);
		this.scatterItemMenu = undefined;
		this.archaeologyMenus = undefined;
		this.selectionTabs = new Map();
		this.categories = new NamespaceRegistry(game.registeredNamespaces);
		this.collections = new NamespaceRegistry(game.registeredNamespaces);
		this.arcanumObeliskRelics = new NamespaceRegistry(game.registeredNamespaces);
		this.skillBonuses = new Map();
	}

	get ObeliskImage() {
		return this.getMediaURL(this._obeliskImage);
	}
	
	get RelicPointImage() {
		return this.getMediaURL(this._relicPointImage);
	}

	get menu() {
		return this.archaeologyArtisanMenu;
	}

	get actionItem() {
		return this.activeRecipe.product;
	}

	get actionItemQuantity() {
		let quantity = this.activeRecipe.baseQuantity;

		/*if (this.activeRecipe.alternativeCosts !== undefined) {
			quantity *= this.activeRecipe.alternativeCosts[this.selectedAltRecipe].quantityMultiplier;
		}

		if (this.isPoolTierActive(1) && this.activeRecipe.category.id === "melvorF:Javelins") {
			quantity++;
		}

		if (this.activeRecipe.category.id === "melvorF:Bolts") {
			if (this.isPoolTierActive(2)) {
				quantity++;
			}

			quantity += this.game.modifiers.increasedFletchingBoltQuantity;
			quantity += this.game.modifiers.increasedBoltProduction - this.game.modifiers.decreasedBoltProduction;
		}

		if (this.activeRecipe.category.id === "melvorF:Javelins") {
			quantity += this.game.modifiers.increasedJavelinProduction - this.game.modifiers.decreasedJavelinProduction;
		}*/

		return quantity;
	}

	get activeRecipe() {
		if (this.selectedRecipe === undefined) {
			throw new Error("Tried to get active archaeology recipe, but none is selected.");
		}

		return this.selectedRecipe;
	}

	GetModifedMaxHP(excavationHotspot) {
		let hp = excavationHotspot.maxHP;

		if (game.petManager.isPetUnlocked(game.pets.filter(pet => pet.id == "archaeology_skill:Digger")[0])) {
			hp -= 5;
		}

		return hp;
	}

	get actionInterval() {
		if (this.selectedRecipe !== undefined) {
			if (this.selectedRecipe instanceof ExcavationHotspot) {
				if (this.selectedRecipe.currentInterval !== undefined) {
					return this.selectedRecipe.currentInterval;
				} else {
					const keys = [...game.combat.player.equipment.slotMap.keys()];
					const minTicks = this.getExcavationHotspotMinInterval(this.selectedRecipe) / TICK_INTERVAL;
					const maxTicks = this.getExcavationHotspotMaxInterval(this.selectedRecipe) / TICK_INTERVAL;
					let roll = rollInteger(minTicks, maxTicks);
					let amount = 0;

					// Loop through equipped items to find if a mattock is equipped
					keys.forEach((v) => {
						if (v instanceof WeaponItem) {
							if (v.type == "Archaeology Mattock") {
								let a = game.archaeology.skillBonuses.get(v);

								if (a !== undefined) {
									a = a.get("archaeology_decrease_excavation_interval");

									if (a !== undefined) {
										amount += a;
									}
								}
							}
						}
					});

					// TODO MAKE IT IN THE TICK INTERVAL TIME
					if (amount !== undefined) {
						let r = Math.floor(roll - (roll * (amount / 100)));

						roll = r < minTicks ? minTicks : r;
					}

					this.selectedRecipe.currentInterval = TICK_INTERVAL * roll;

					return this.selectedRecipe.currentInterval;
				}
			} else if (this.selectedRecipe instanceof WorkbenchRecipe) {
				let interval = 15000;
				const keys = [...game.combat.player.equipment.slotMap.keys()];

				// Loop through equipped items to find if Archaeology skillcape is equipped
				keys.forEach((v) => {
					if (v instanceof Item) {
						if (v.type == "Armour") {
							let a = game.archaeology.skillBonuses.get(v);

							if (a !== undefined) {
								a = a.get("archaeology_decrease_workbench_interval");

								if (a !== undefined) {
									interval -= (15000 * (a / 100));
								}
							}
						}
					}
				});

				return interval;
			}
		} else {
			return 0;
		}
	}

	get activeRecipe() {
		//if (this.selectedRecipe === undefined) {
		//	throw new Error("Tried to get active archaeology recipe, but none is selected.");
		//}

		return this.selectedRecipe;
	}

	createButtonOnClick() {
		if (this.archaeologyArtisanMenu.product !== undefined) {
			if (this.isActive) {
				this.stop();

				if (this.selectedRecipe instanceof ExcavationHotspot) {
					this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
						digSiteMenu.SetStartButtonState(true);
					});
					this.renderQueue.updateExcavationHotspotHP = true;
					this.renderQueue.progressBar = true;
				}

				if (this.selectedRecipe != this.archaeologyArtisanMenu.selectedRecipe) {
					this.selectedRecipe = this.archaeologyArtisanMenu.selectedRecipe;
					this.start();
					this.archaeologyArtisanMenu.animateProgressFromTimer(this.actionTimer);
					this.render();
				}
			} else {
				if (this.getRecipeCosts(this.archaeologyArtisanMenu.selectedRecipe).checkIfOwned()) {
					//this.selectedRecipe = this.actions.filter(action => action.product === this.archaeologyArtisanMenu.product)[0];
					this.selectedRecipe = this.archaeologyArtisanMenu.selectedRecipe;
					this.start();
					this.archaeologyArtisanMenu.animateProgressFromTimer(this.actionTimer); // TODO REMOVE THIS AND MAKE PROGRESS BAR TRUE
					//this.renderQueue.progressBar = true;
					this.render();
				} else {
					notifyPlayer(this, this.noCostsMessage, "danger");
				}
			}
		}
	}

	get noCostsMessage() {
		return getLangString("TOAST_MATERIALS_REQUIRED_TO_RESTORE");
	}

	get currentActionInterval() {
		return this.actionTimer.maxTicks * TICK_INTERVAL;
	}

	registerData(namespace, data) {
		super.registerData(namespace, data);
		this._obeliskImage = data.obeliskImage;
		this._relicPointImage = data.relicPointImage;

		if (data.excavationHotspots !== null && data.excavationHotspots !== void 0) {
			data.excavationHotspots.forEach((excavationHotspot) => {
				this.actions.registerObject(new ExcavationHotspot(namespace, excavationHotspot, this.game));
			});
		} else {
			console.log("Null or void 0");
		}

		if (data.digSites !== null && data.digSites !== void 0) {
			data.digSites.forEach((digSite) => {
				this.digSites.registerObject(new DigSites(namespace, digSite, this, this.game));
			});
		} else {
			console.log("Null or void 0");
		}

		if (data.categories !== null && data.categories !== void 0) {
			data.categories.forEach((category) => {
				this.categories.registerObject(new SkillCategory(namespace, category, this));
			});
		} else {
			console.log("Null or void 0");
		}

		if (data.workbenchRecipe !== null && data.workbenchRecipe !== void 0) {
			data.workbenchRecipe.forEach((recipe) => {
				this.actions.registerObject(new WorkbenchRecipe(namespace, recipe, this.game, this));
			});
		} else {
			console.log("Null or void 0");
		}

		if (data.collections !== null && data.collections !== void 0) {
			data.collections.forEach((collection) => {
				this.collections.registerObject(new Collections(namespace, collection, this, this.game));
			});
		} else {
			console.log("Null or void 0");
		}

		if (data.arcanumObeliskRelics !== null && data.arcanumObeliskRelics !== void 0) {
			data.arcanumObeliskRelics.forEach((arcanumObeliskRelic) => {
				this.arcanumObeliskRelics.registerObject(new ArcanumObeliskRelics(namespace, arcanumObeliskRelic));
			});
		} else {
			console.log("Null or void 0");
		}

		if (data.skill_bonuses !== null && data.skill_bonuses !== void 0) {
			data.skill_bonuses.forEach((bonus) => {
				if (bonus.type == "Item") {
					const item = game.items.getObjectByID(bonus.id);

					if (item === undefined) {
						throw new Error(`Error constructing SkillBonus. Item with id: ${id} is not registered.`);
					}

					if (bonus.bonuses !== null && bonus.bonuses !== void 0) {
						let temp = new Map();

						Object.entries(bonus.bonuses).forEach((b) => {
							temp.set(b[0], b[1]);
						});

						this.skillBonuses.set(item, temp);
					} else {
						console.log("Null or void 0");
					}
				} else if (bonus.type == "Mastery") {
					if (bonus.bonuses !== null && bonus.bonuses !== void 0) {
						let temp = new Map();

						Object.entries(bonus.bonuses).forEach((b) => {
							temp.set(b[0], b[1]);
						});

						this.skillBonuses.set(bonus.id, temp);
					} else {
						console.log("Null or void 0");
					}
				}
			});
		} else {
			console.log("Null or void 0");
		}
	}

	postDataRegistration() {
		super.postDataRegistration();
		this.sortedMasteryActions = this.actions.filter(action => action instanceof ExcavationHotspot).sort((a, b) => a.level - b.level);
		this.milestones.push(...this.actions.allObjects);
		this.sortMilestones();
	}

	computeTotalMasteryActions() {
		this.actions.namespaceMaps.forEach((actionMap, namespace) => {
			let count = 0;

			actionMap.forEach(action => {
				if (!(action instanceof WorkbenchRecipe)) {
					count++;
				}
			});

			this.totalMasteryActions.set(namespace, count);
		});
	}

	getTotalUnlockedMasteryActions() {
		console.log("getTotalUnlockedMasteryActions");

		return this.actions.filter((action) => {
			return (this.level >= action.level) && (action instanceof ExcavationHotspot)
		}).length;
	}

	getExcavationHotspotMinInterval(excavationHotspot) {
		return excavationHotspot.baseMinInterval;
	}

	getExcavationHotspotMaxInterval(excavationHotspot) {
		return excavationHotspot.baseMaxInterval;
	}

	getMasteryXPModifier(action) {
		let modifier = super.getMasteryXPModifier(action);

		if (this.isPoolTierActive(0)) {
			let c = game.archaeology.skillBonuses.get("Mastery_Pool:Tier_0").get("archaeology_increase_mastery_xp");

			if (c !== undefined) {
				modifier += c;
			}
		}

		return modifier;
	}

	getModifiedItemsRequired(items) {
		let temp = items;

		for (let i = 0; i < temp.length; i++) {
			if (temp[i].item.type != "Archaeology Artefact") {
				if (this.isPoolTierActive(2)) {
					temp[i].quantity = Math.ceil(temp[i].quantity / 2);

					if (temp[i].quantity == 0) {
						temp[i].quantity = 1;
					}
				}
			}
		}

		return temp;
	}

	getCurrentRecipeCosts() {
		if (this.activeRecipe instanceof ExcavationHotspot) {
			const costs = new Costs(this.game);

			return costs;
		} else if (this.activeRecipe instanceof WorkbenchRecipe) {
			return this.getRecipeCosts(this.activeRecipe);
		}
	}

	getRecipeCosts(item) {
		const costs = new Costs(this.game);
		const product = item;

		if (item !== undefined) {
			product.itemCosts.forEach(({item, quantity}) => {
				quantity = this.modifyItemCost(item, quantity, product);

				if (quantity > 0) {
					costs.addItem(item, quantity);
				}
			});

			if (product.gpCost > 0) {
				costs.addGP(this.modifyGPCost(product));
			}

			if (product.scCost > 0) {
				costs.addSlayerCoins(this.modifySCCost(product));
			}
		}

		return costs;

		/*const costs = new Costs(this.game);
		const product = this.actions.filter(action => action.product === item)[0];

		if (product !== undefined) {
			product.itemCosts.forEach(({item, quantity}) => {
				quantity = this.modifyItemCost(item, quantity, product);

				if (quantity > 0) {
					costs.addItem(item, quantity);
				}
			});

			if (product.gpCost > 0) {
				costs.addGP(this.modifyGPCost(product));
			}

			if (product.scCost > 0) {
				costs.addSlayerCoins(this.modifySCCost(product));
			}
		}

		return costs;*/
	}

	modifyItemCost(item, quantity, recipe) {
		let q = quantity;

		if (item.type === "Archaeology Material") {
			if (game.archaeology.isPoolTierActive(2)) {
				q = Math.ceil(q / 2);

				if (q == 0) {
					q = 1;
				}
			}
		}

		return q;
	}

	AddRelicPoint(amount) {
		this.currentRelicPoints += amount;
		this.arcanumObeliskMenu.UpdateCurrentRelicPoints();
		imageNotify(this.RelicPointImage, `+${amount}`, "success");
	}

	UnlockRelic(relic) {
		const arcanumObeliskRelic = this.arcanumObeliskRelics.getObjectByID(relic.id);

		if (arcanumObeliskRelic !== undefined) {
			if (this.currentRelicPoints > 0) {
				arcanumObeliskRelic.isUnlocked = true;
				this.currentRelicPoints--;
				this.arcanumObeliskMenu.UpdateCurrentRelicPoints();
			} else {
				notifyPlayer(this, getLangString("TOAST_NOT_ENOUGH_RELIC_POINTS"), "danger");
			}
		} else {
			console.log("Cannot find relic");
		}
	}

	recordCostConsumptionStats(costs) {
		//costs.recordBulkItemStat(this.game.stats.Archaeology, ArchaeologyStats.ItemsUsed);
	}

	preAction() {}
	postAction() {}

	action() {
		const recipeCosts = this.getCurrentRecipeCosts();
		if (!recipeCosts.checkIfOwned()) {
			if (this.showNotifications) {
				this.game.combat.notifications.add({
					type: "Player",
					args: [this, this.noCostsMessage, "danger"]
				});
			}
			this.stop();

			return;
		}

		this.preAction();

		const continueSkill = this.addActionRewards();
		const preserve = rollPercentage(this.actionPreservationChance);

		if (preserve) {
			if (this.showNotifications) {
				this.game.combat.notifications.add({
					type: "Preserve",
					args: [this]
				});
			}
			this.recordCostPreservationStats(recipeCosts);
		} else {
			recipeCosts.consumeCosts();
			this.recordCostConsumptionStats(recipeCosts);
		}

		this.postAction();

		const nextCosts = this.getCurrentRecipeCosts();

		if (nextCosts.checkIfOwned() && continueSkill) {
			this.startActionTimer();
		} else {
			this.stop();
		}
	}

	get actionRewards() {
		if (this.activeRecipe instanceof ExcavationHotspot) {
			const currentExcavationHotspot = this.activeRecipe;

			if (currentExcavationHotspot === undefined) {
				throw new Error("Tried to get actionRewards, but no Excavation Hotspot is selected.");
			}

			if (currentExcavationHotspot.currentHP > currentExcavationHotspot.hitpoints) {
				currentExcavationHotspot.currentHP = currentExcavationHotspot.hitpoints;
			}

			const rewards = new Rewards(this.game);
			let successChance = 100 - this.baseFailExcavationChance;
			const currentMasteryLevel = game.archaeology.getMasteryLevel(currentExcavationHotspot);
			const result = game.archaeology.masteryLevelUnlocks.reduce((p, c) => {
				if (c.level <= currentMasteryLevel && (!p || c.level > p.level)) {
					return c;
				}

				return p;
			});

			if (result.level <= currentMasteryLevel) {
				let c = game.archaeology.skillBonuses.get("Mastery_Level:Tier_" + result._descriptionID).get("archaeology_decrease_failed_excavation_chance");

				if (c !== undefined) {
					successChance += c;
				}
			}

			if (successChance > 100) {
				successChance = 100;
			}

			if (rollPercentage(successChance)) {
				const actionEvent = new ArchaeologyActionEvent(this, currentExcavationHotspot);
				let doubleSoilsChance = this.baseDoubleSoilChance;

				if (this.isPoolTierActive(1)) {
					let c = game.archaeology.skillBonuses.get("Mastery_Pool:Tier_1").get("archaeology_increase_soil_double_chance");

					if (c !== undefined) {
						doubleSoilsChance += c;
					}
				}

				if (doubleSoilsChance > 100) {
					doubleSoilsChance = 100;
				}

				if (rollPercentage(doubleSoilsChance)) {
					rewards.addItem(currentExcavationHotspot.soil, 2);
				} else {
					rewards.addItem(currentExcavationHotspot.soil, 1);
				}

				currentExcavationHotspot.currentHP++;

				if (currentExcavationHotspot.currentHP == currentExcavationHotspot.hitpoints) {
					const activePotion = this.activePotion;
					let findArtefactChance = this.baseFindArtefactChance;

					if (this.isPoolTierActive(3)) {
						let c = game.archaeology.skillBonuses.get("Mastery_Pool:Tier_3").get("archaeology_increase_artefact_drop_rate");

						if (c !== undefined) {
							findArtefactChance += c;
						}
					}

					if (activePotion !== undefined) {
						let a = game.archaeology.skillBonuses.get(activePotion.id);

						if (a !== undefined) {
							a = a.get("archaeology_increase_artefact_drop_rate");

							if (a !== undefined) {
								findArtefactChance += a;
							}
						}
					}

					if (!this.foundFirstArtefact) {
						if (currentExcavationHotspot.level == 1) {
							findArtefactChance = 100;
							this.foundFirstArtefact = true;
						}
					}

					if (rollPercentage(findArtefactChance)) {
						const artefact = currentExcavationHotspot.artefactDropTable.getDrop();

						rewards.addItem(artefact.item, artefact.quantity);
						rewards.addXP(this, currentExcavationHotspot.baseExperienceArtefact);
						this.addCommonRewards(rewards);
					} else {
						rewards.addXP(this, currentExcavationHotspot.baseExperienceFailure);
						
						if (this.showNotifications) {
							notifyPlayer(this, getLangString("TOAST_FAILED_ARTEFACT"), "danger");
						}
					}

					currentExcavationHotspot.currentHP = 0;
					currentExcavationHotspot.hitpoints = this.GetModifedMaxHP(currentExcavationHotspot);
					this.game.processEvent(actionEvent, this.currentActionInterval);
				} else {
					let findMaterialChance = this.baseFindMaterialChance;
					const keys = [...game.combat.player.equipment.slotMap.keys()];

					// Loop through equipped items to find if a mattock is equipped
					keys.forEach((v) => {
						if (v instanceof WeaponItem) {
							if (v.type == "Archaeology Mattock") {
								let a = game.archaeology.skillBonuses.get(v);

								if (a !== undefined) {
									a = a.get("archaeology_increase_material_drop_rate");

									if (a !== undefined) {
										findMaterialChance += a;
									}
								}
							}
						}
					});

					if (rollPercentage(findMaterialChance)) {
						const material = currentExcavationHotspot.materialDropTable.getDrop();

						rewards.addItem(material.item, material.quantity);
						rewards.addXP(this, currentExcavationHotspot.baseExperienceSuccess);
						this.addCommonRewards(rewards);
					} else {
						rewards.addXP(this, currentExcavationHotspot.baseExperienceFailure);
						
						if (this.showNotifications) {
							notifyPlayer(this, getLangString("TOAST_FAILED_MATERIAL"), "danger");
						}
					}
				}
			} else {
				rewards.addXP(this, currentExcavationHotspot.baseExperienceFailure);
				
				if (this.showNotifications) {
					notifyPlayer(this, getLangString("TOAST_FAILED_DIGGING"), "danger");
				}
			}
			
			this.renderQueue.updateExcavationHotspotHP = true;
			this.selectedRecipe.currentInterval = undefined;

			return rewards;
		} else if (this.activeRecipe instanceof WorkbenchRecipe) {
			const currentRecipe = this.activeRecipe;

			if (currentRecipe === undefined) {
				throw new Error("Tried to get actionRewards, but no Workbench recipe is selected.");
			}

			const rewards = new Rewards(this.game);
			const item = this.actionItem;
			let quantityToAdd = this.actionItemQuantity;

			rewards.addItem(item, quantityToAdd);
			rewards.addXP(this, this.actionXP);
			//this.game.stats.Fletching.add(FletchingStats.ItemsFletched, qtyToAdd);
			this.addCommonRewards(rewards);

			return rewards;
		}
	}

	addMasteryXPReward() {
		if (this.activeRecipe instanceof ExcavationHotspot) {
			this.addMasteryForAction(this.activeRecipe, this.masteryModifiedInterval);
		}
	}

	get masteryModifiedInterval() {
		return this.actionInterval;
	}

	addMasteryXPReward() {
		if (!(this.activeRecipe instanceof WorkbenchRecipe)) {
			super.addMasteryXPReward();
		}
	}

	getActionMasteryXP(action) {
		if (action instanceof ExcavationHotspot) {
			return this.getMasteryXPToAddForAction(action, this.masteryModifiedInterval);
		} else {
			return 0;
		}
	}

	getBaseActionMasteryXP(action) {
		if (action instanceof ExcavationHotspot) {
			return this.getBaseMasteryXPToAddForAction(action, this.masteryModifiedInterval);
		} else {
			return 0;
		}
	}

	updateTotalCurrentMasteryLevel() {
		this._totalCurrentMasteryLevel.clear();

		const trueMasteries = new SparseNumericMap();

		this.actionMastery.forEach(({level}, action) => {
			if (!(action instanceof DummyMasteryAction) && !(action instanceof WorkbenchRecipe)) {
				this._totalCurrentMasteryLevel.add(action.namespace, level);
				trueMasteries.add(action.namespace, 1);
			}
		});
		this.totalMasteryActions.forEach((total, namespace) => {
			this._totalCurrentMasteryLevel.add(namespace, total - trueMasteries.get(namespace));
		});
    }

	selectRecipeOnClick(recipe) {
		if (recipe instanceof ExcavationHotspot) {
			if (recipe !== this.selectedRecipe) {
				if (this.selectedRecipe instanceof ExcavationHotspot) {
					let oldRecipe;
					let oldDigSite;
					let newRecipe;
					let newDigSite;
					let newDigSiteMenu;

					this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
						digSiteMenu.digSite.excavationHotspots.forEach((excavationHotspot) => {
							if (this.activeRecipe === excavationHotspot) {
								oldRecipe = excavationHotspot;
								oldDigSite = digSiteMenu.digSite;
							}

							if (recipe == excavationHotspot) {
								newRecipe = excavationHotspot;
								newDigSite = digSiteMenu.digSite;
								newDigSiteMenu = digSiteMenu;
							}
						});
					});

					if (oldDigSite == newDigSite) {
						this.stop();
						newDigSiteMenu.SetStartButtonState(false);
						newDigSiteMenu.selectedExcavationHotspot = newRecipe;
						newDigSiteMenu.SetSelectedExcavationHotspot(newRecipe);
						this.renderQueue.updateExcavationHotspotHP = true;
						this.renderQueue.progressBar = true;
					} else {
						newDigSiteMenu.SetStartButtonState(true);
						newDigSiteMenu.selectedExcavationHotspot = newRecipe;
						newDigSiteMenu.SetSelectedExcavationHotspot(newRecipe);
						this.renderQueue.updateExcavationHotspotHP = true;
						this.renderQueue.progressBar = true;
					}
				} else if (this.selectedRecipe instanceof WorkbenchRecipe || this.selectedRecipe === undefined) {
					this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
						digSiteMenu.digSite.excavationHotspots.forEach((excavationHotspot) => {
							if (excavationHotspot == recipe) {
								digSiteMenu.SetStartButtonState(true);
								digSiteMenu.selectedExcavationHotspot = excavationHotspot;
								digSiteMenu.SetSelectedExcavationHotspot(excavationHotspot);
								this.renderQueue.updateExcavationHotspotHP = true;
								this.renderQueue.progressBar = true;
							}
						});
					});
				}
			} else {
				this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
					digSiteMenu.digSite.excavationHotspots.forEach((excavationHotspot) => {
						if (excavationHotspot == recipe) {
							digSiteMenu.SetStartButtonState(true);
							digSiteMenu.selectedExcavationHotspot = excavationHotspot;
							digSiteMenu.SetSelectedExcavationHotspot(excavationHotspot);
							this.renderQueue.updateExcavationHotspotHP = true;
							this.renderQueue.progressBar = true;
						}
					});
				});
			}
		} else if (recipe instanceof WorkbenchRecipe) {
			if (this.isActive) {
				if (this.selectedRecipe instanceof ExcavationHotspot) {
					this.archaeologyArtisanMenu.selectedRecipe = recipe;
					this.renderQueue.selectedRecipe = true;
					this.render();

					if (nativeManager.isMobile) {
						try {
							const element = document.getElementById(`${this.localID.toLowerCase()}-category-container`);
	
							window.scrollTo({
								top: element.offsetTop + 300,
								behavior: "smooth"
							});
						} catch (e) {
							console.warn("Could not scroll to element. Error: " + e);
						}
					}
				} else if (this.selectedRecipe instanceof WorkbenchRecipe) {
					if (this.selectedRecipe !== recipe) {
						this.stop();
						this.archaeologyArtisanMenu.selectedRecipe = recipe;
						this.renderQueue.selectedRecipe = true;
						this.render();

						if (nativeManager.isMobile) {
							try {
								const element = document.getElementById(`${this.localID.toLowerCase()}-category-container`);
		
								window.scrollTo({
									top: element.offsetTop + 300,
									behavior: "smooth"
								});
							} catch (e) {
								console.warn("Could not scroll to element. Error: " + e);
							}
						}
					}
				}
			} else {
				this.archaeologyArtisanMenu.selectedRecipe = recipe;
				this.renderQueue.selectedRecipe = true;
				this.render();

				if (nativeManager.isMobile) {
					try {
						const element = document.getElementById(`${this.localID.toLowerCase()}-category-container`);
		
						window.scrollTo({
							top: element.offsetTop + 300,
							behavior: "smooth"
						});
					} catch (e) {
						console.warn("Could not scroll to element. Error: " + e);
					}
				}
			}
		}
	}

	/*SelectExcavationHotspot(digSite, excavationHotspot) {
		if (this.activeExcavationHotspot !== undefined && this.activeExcavationHotspot !== excavationHotspot) {
			this.activeExcavationHotspot = undefined;
			this.stop();
		}

		digSite.SetStartButtonState(true);
		digSite.selectedExcavationHotspot = excavationHotspot;
		digSite.SetSelectedExcavationHotspot(excavationHotspot);
		this.renderQueue.updateExcavationHotspotHP = true;
	}*/

	StartStopExcavationHotspot(digSiteMenu) {
		const keys = [...game.combat.player.equipment.slotMap.keys()];
		let mattockEquipped = false;

		// Loop through equipped items to find if a mattock is equipped
		keys.forEach((v) => {
			if (v instanceof WeaponItem) {
				if (v.type == "Archaeology Mattock") {
					mattockEquipped = true;
				}
			}
		});

		if (mattockEquipped) {
			if (digSiteMenu.selectedExcavationHotspot === undefined) {
				digSiteMenu.SetStartButtonState(true);
				this.activeExcavationHotspot = undefined;
				this.stop();
				this.renderQueue.progressBar = true;
			} else {
				if (this.isActive) {
					if (digSiteMenu.selectedExcavationHotspot == this.selectedRecipe) {
						digSiteMenu.SetStartButtonState(true);
						this.stop();
						this.renderQueue.progressBar = true;
					} else {
						this.archaeologyMenus.digSites.forEach((dsm) => {
							if (dsm.selectedExcavationHotspot == this.selectedRecipe) {
								dsm.SetStartButtonState(true);
							}
						});

						this.stop();
						this.renderQueue.progressBar = true;
						digSiteMenu.SetStartButtonState(false);
						this.selectedRecipe = digSiteMenu.selectedExcavationHotspot;
						this.start();
						this.renderQueue.progressBar = true;
					}
				} else {
					digSiteMenu.SetStartButtonState(false);
					this.selectedRecipe = digSiteMenu.selectedExcavationHotspot;
					this.start();
					this.renderQueue.progressBar = true;
				}
			}
		} else {
			notifyPlayer(this, templateLangString("TOAST_MATTOCK_ITEM_NOT_EQUIPPED"), "danger");
		}
	}

	onLoad() {
		super.onLoad();
		this.renderQueue.excavationHotspots = true;
		this.renderQueue.selectedExcavationHotspot = true;
		this.GiveNewJoinerBook();
	}
	
	onStop() {
		this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
			digSiteMenu.SetStartButtonState(true);
		});
		this.activeExcavationHotspot = undefined;
		this.renderQueue.selectedExcavationHotspot = true;
		this.renderQueue.progressBar = true;
	}

	onLevelUp(oldLevel, newLevel) {
		super.onLevelUp(oldLevel, newLevel);
		this.renderQueue.excavationHotspots = true;
	}

	updateMasteryDisplays(action) {
		if (!action instanceof WorkbenchRecipe) {
			super.updateMasteryDisplays(action);
		}
	}

	render() {
		if (this.readNewJoinersBook != this.isUnlocked) {
			this.setUnlock(this.readNewJoinersBook);
		}

		if (this.renderQueue.progressBar) {
			if (this.activeRecipe !== undefined) {
				if (this.activeRecipe instanceof ExcavationHotspot) {
					if (this.archaeologyMenus !== undefined) {
						this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
							if (digSiteMenu.selectedExcavationHotspot == this.activeRecipe) {
								if (this.isActive) {
									digSiteMenu.diggingProgress.animateProgressFromTimer(this.actionTimer);
									this.archaeologyArtisanMenu.stopProgressBar();
								} else {
									digSiteMenu.diggingProgress.stopAnimation();
								}
							} else {
								digSiteMenu.diggingProgress.stopAnimation();
							}
						});
					}
				} else if (this.activeRecipe instanceof WorkbenchRecipe) {
					if (this.archaeologyArtisanMenu !== undefined) {
						if (this.isActive) {
							this.archaeologyArtisanMenu.animateProgressFromTimer(this.actionTimer);
							this.archaeologyMenus.digSites.forEach((digSiteMenu) => {
								digSiteMenu.diggingProgress.stopAnimation();
							});
						} else {
							this.archaeologyArtisanMenu.stopProgressBar();
						}
					}
				}
			}

			this.renderQueue.progressBar = false;
		}

		super.render();
		this.renderExcavationHotspots();
		this.renderSelectedExcavationHotspot();
		this.renderUpdateExcavationHotspotHP();
	}

	renderExcavationHotspots() {
		if (!this.renderQueue.excavationHotspots) {
			return;
		}

		this.archaeologyMenus.digSites.forEach((digSite) => {
			digSite.excavationHotspotButtons.forEach((excavationHotspotButton) => {
				if (game.archaeology.level >= excavationHotspotButton.excavationHotspot.level) {
					excavationHotspotButton.SetExcavationHotspotUnlocked();
				} else {
					excavationHotspotButton.SetExcavationHotspotLocked();
				}
			});
		});

		this.renderQueue.excavationHotspots = false;
	}

	renderSelectedExcavationHotspot() {
		if (!this.renderQueue.selectedExcavationHotspot) {
			return;
		}

		this.renderQueue.selectedExcavationHotspot = false;
	}

	renderUpdateExcavationHotspotHP() {
		if (!this.renderQueue.updateExcavationHotspotHP) {
			return;
		}

		if (this.archaeologyMenus !== undefined) {
			this.archaeologyMenus.digSites.forEach((digSite) => {
				if (digSite.selectedExcavationHotspot !== undefined) {
					digSite.UpdateHP();
				}
			});
		}

		this.renderQueue.updateExcavationHotspotHP = false;
	}

	renderSelectedRecipe() {
		if (!this.renderQueue.selectedRecipe) {
			return;
		}

		if (this.archaeologyArtisanMenu.selectedRecipe !== undefined) {
			if (this.archaeologyArtisanMenu.selectedRecipe instanceof WorkbenchRecipe) {
				const product = game.archaeology.actions.filter(action => action.localID == this.archaeologyArtisanMenu.selectedRecipe.localID)[0];
				const costs = this.getRecipeCosts(this.archaeologyArtisanMenu.selectedRecipe);

				this.menu.setSelected(this.archaeologyArtisanMenu.selectedRecipe);
				this.menu.setProduct(product, product.baseQuantity); // TODO Make it get modified quantities
				this.menu.setIngredients(costs.getItemQuantityArray(), costs.gp, costs.sc);
				this.menu.updateGrants();
				this.renderQueue.recipeInfo = true;
				this.renderQueue.actionMastery.add(this.masteryAction);
			}
		}

		this.renderQueue.selectedRecipe = false;
	}

	renderRecipeInfo() {
		if (!this.renderQueue.recipeInfo) {
			return;
		}

		this.menu.updateGrants(this.modifyXP(this.archaeologyArtisanMenu.selectedRecipe.baseExperience), this.archaeologyArtisanMenu.selectedRecipe.baseExperience, 0, 0, 0);
		this.menu.updateChances(this.actionPreservationChance, this.actionDoublingChance);

		let interval = 15000;
		const keys = [...game.combat.player.equipment.slotMap.keys()];

		// Loop through equipped items to find if Archaeology skillcape is equipped
		keys.forEach((v) => {
			if (v instanceof Item) {
				if (v.type == "Armour") {
					let a = game.archaeology.skillBonuses.get(v);

					if (a !== undefined) {
						a = a.get("archaeology_decrease_workbench_interval");

						if (a !== undefined) {
							interval -= (15000 * (a / 100));
						}
					}
				}
			}
		});
		this.menu.updateInterval(interval);
		this.renderQueue.recipeInfo = false;
	}

	GiveNewJoinerBook() {
		if (game.stats.Items.getTracker(game.items.getObjectByID("archaeology_skill:Archaeology_New_Joiner")).get(ItemStats.TimesFound) == 0) {
			game.bank.addItemByID("archaeology_skill:Archaeology_New_Joiner", 1, false, true, true);
		}
	}

	resetActionState() {
		super.resetActionState();
		this.activeExcavationHotspot = undefined;
	}

	encode(writer) {
		super.encode(writer);
		writer.writeBoolean(this.readNewJoinersBook);
		writer.writeBoolean(this.foundFirstArtefact);
		writer.writeArray(this.digSites.allObjects, (digSite, writer) => {
			writer.writeNamespacedObject(digSite);
			writer.writeArray(digSite.excavationHotspots, (excavationHotspot, writer) => {
				writer.writeNamespacedObject(excavationHotspot);
				writer.writeInt32(excavationHotspot.currentHP);
			});
		});
		writer.writeArray(this.collections.allObjects, (collection, writer) => {
			writer.writeNamespacedObject(collection);
			writer.writeBoolean(collection.rewardClaimed);
			writer.writeArray(collection.requiredItems, (requiredItem, writer) => {
				writer.writeNamespacedObject(requiredItem.item);
				writer.writeBoolean(requiredItem.returned);
			});
		});
		writer.writeInt32(this.currentRelicPoints);
		writer.writeArray(this.arcanumObeliskRelics.allObjects, (arcanumObeliskRelic, writer) => {
			writer.writeNamespacedObject(arcanumObeliskRelic);
			writer.writeBoolean(arcanumObeliskRelic.isUnlocked);
		});
		this.currentRelicPowers.encode(writer);

		return writer;
	}

	decode(reader, version) {
		super.decode(reader, version);
		this.readNewJoinersBook = reader.getBoolean();
		this.foundFirstArtefact = reader.getBoolean();
		reader.getArray((reader) => {
			const digSite = reader.getNamespacedObject(game.archaeology.digSites);

			reader.getArray((reader) => {
				const excavationHotspot = reader.getNamespacedObject(game.archaeology.actions);
				const currentHP = reader.getInt32();

				excavationHotspot.currentHP = currentHP;
			});
		});
		reader.getArray((reader) => {
			const collection = reader.getNamespacedObject(game.archaeology.collections);
			const rewardClaimed = reader.getBoolean();
			
			collection.rewardClaimed = rewardClaimed;
			reader.getArray((reader) => {
				const item = reader.getNamespacedObject(game.items);
				const returned = reader.getBoolean();

				for (let i = 0; i < collection.requiredItems.length; i++) {
					if (collection.requiredItems[i].item == item) {
						collection.requiredItems[i].returned = returned;

						break;
					}
				}
			});
		});
		this.currentRelicPoints = reader.getInt32();
		reader.getArray((reader) => {
			const relic = reader.getNamespacedObject(game.archaeology.arcanumObeliskRelics);
			const isUnlocked = reader.getBoolean();

			if (!(typeof relic === "string")) {
				relic.isUnlocked = isUnlocked;
			}
		});
		this.currentRelicPowers.decode(reader, version);
		this.archaeologyCollectionsMenu.UpdateCollectionsContainerList();
		this.arcanumObeliskMenu.relicPowerIconMenus.forEach((relicMenu) => {
			relicMenu.UpdateLockedState();
		});

		if (game.archaeology.isActive) {
			if (game.archaeology.selectedRecipe !== undefined) {
				if (game.archaeology.selectedRecipe instanceof ExcavationHotspot) {
					game.archaeology.archaeologyMenus.digSites.forEach((digSiteMenu) => {
						digSiteMenu.digSite.excavationHotspots.forEach((digSite) => {
							if (digSite === game.archaeology.selectedRecipe) {
								digSiteMenu.selectedExcavationHotspot = game.archaeology.selectedRecipe;
								digSiteMenu.SetSelectedExcavationHotspot(game.archaeology.selectedRecipe);
								digSiteMenu.SetStartButtonState(false);
								this.renderQueue.updateExcavationHotspotHP = true;
								this.renderQueue.progressBar = true;
							}
						});
					});
				} else if (game.archaeology.selectedRecipe instanceof WorkbenchRecipe) {
					this.archaeologyArtisanMenu.selectedRecipe = this.selectedRecipe;
					this.renderQueue.selectedRecipe = true;
					this.render();

					if (nativeManager.isMobile) {
						try {
							const element = document.getElementById(`${this.localID.toLowerCase()}-category-container`);
			
							window.scrollTo({
								top: element.offsetTop + 300,
								behavior: "smooth"
							});
						} catch (e) {
							console.warn("Could not scroll to element. Error: " + e);
						}
					}

					game.archaeology.renderQueue.selectionTabs = true;
					$("#archaeology-workbench-container").removeClass("d-none");
					$("#archaeology-area-container").addClass("d-none");
					$("#archaeology-collection-container").addClass("d-none");
					$("#archaeology-arcanum-obelisk-container").addClass("d-none");
					game.archaeology.renderQueue.progressBar = true;
				}
			}
		}
	}
}