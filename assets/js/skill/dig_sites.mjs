export class DigSites extends NamespacedObject {
	constructor(namespace, data, archaeology, game) {
		super(namespace, data.id);
		this._name = data.name;
		this.excavationHotspots = data.excavationHotspotIDs.map((id) => {
			const excavationHotspot = archaeology.actions.getObjectByID(id);

			if (excavationHotspot === undefined) {
				throw new Error(`Error constructing DigSites with id ${this.id}. ExcavationHotspot with id: ${id} is not registered.`);
			}

			return excavationHotspot;
		});
	}

	get name() {
		return this._name;
	}
}