const { patch } = mod.getContext(import.meta);

patch(Costs, "consumeCosts").replace(function(o) {
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
				if (game.archaeology !== undefined) {
					if (game.archaeology.isPoolTierActive(2)) {
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