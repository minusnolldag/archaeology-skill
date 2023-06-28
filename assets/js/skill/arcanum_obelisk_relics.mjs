export class ArcanumObeliskRelics extends NamespacedObject {
	constructor(namespace, data) {
		super(namespace, data.id);
		this._name = data.name;
		this._media = data.media;
		this.modifiers = data.modifiers;
		this.isUnlocked = false;
	}

	get name() {
		return this._name;
	}

	get media() {
		return this.getMediaURL(this._media);
	}
}