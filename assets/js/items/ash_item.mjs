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