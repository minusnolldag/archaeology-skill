export class Collections extends NamespacedObject {
	constructor(namespace, data, archaeology, game) {
		super(namespace, data.id);
		this._name = data.name;
		this.requiredItems = data.requiredItems.map((id) => {
			const requiredItem = game.items.getObjectByID(id);

			if (requiredItem === undefined) {
				throw new Error(`Error constructing Collections with id ${this.id}. Collection with id: ${id} is not registered.`);
			}

			return {
				item: requiredItem,
				returned: false
			};
		});
		this.rewardClaimed = false;
		this.rewardGold = data.rewardGold;
		this.rewardXp = data.rewardXp;
	}

	get name() {
		return this._name;
	}
}