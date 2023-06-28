export class EquippedRelics {
	constructor(maxRelics, archaeology) {
		this.maxRelics = maxRelics;
		this.archaeology = archaeology;
		this.relics = [];

		for (let i = 0; i < this.maxRelics; i++) {
			this.AddRelic();
		}
	}

	AddRelic() {
		this.relics.push(this.archaeology.emptyArcanumObeliskRelic);
	}

	EquipRelic(relic) {
		let r1 = this.relics.find((slot) => slot === relic);

		if (r1 === undefined) {
			let r2 = this.relics.find((slot) => slot === this.archaeology.emptyArcanumObeliskRelic);

			if (r2 !== undefined) {
				for (let i = 0; i < this.maxRelics; i++) {
					if (this.relics[i] === this.archaeology.emptyArcanumObeliskRelic) {
						this.relics[i] = relic;
						game.combat.player.computeModifiers();

						return true;
					}
				}
			} else {
				notifyPlayer(game.archaeology, templateString(getLangString("TOAST_MAX_RELICS_EQUIPPED"), {
					number: this.maxRelics
				}), "danger");
			}
		} else {
			notifyPlayer(game.archaeology, templateString(getLangString("TOAST_RELIC_ALREADY_EQUIPPED"), {
				name: relic.name
			}), "danger");
		}

		return false;
	}

	UnequipRelic(relic) {
		for (let i = 0; i < this.maxRelics; i++) {
			if (this.relics[i] === relic) {
				this.relics[i] = this.archaeology.emptyArcanumObeliskRelic;
				game.combat.player.computeModifiers();

				break;
			}
		}

		game.archaeology.arcanumObeliskMenu.UpdateCurrentRelicPowers();
	}

	encode(writer) {
		writer.writeArray(this.relics, (slot, writer) => {
			writer.writeNamespacedObject(slot);
		});

		return writer;
	}

	decode(reader, version) {
		this.relics = reader.getArray((reader) => {
			const relic = reader.getNamespacedObject(this.archaeology.arcanumObeliskRelics);

			if (typeof relic !== "string") {
				return relic;
			}

			return undefined;
		});

		while (this.relics.length < this.maxRelics) {
			this.AddRelic();
		}

		game.archaeology.arcanumObeliskMenu.UpdateCurrentRelicPowers();
	}
}