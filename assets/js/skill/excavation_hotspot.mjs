export class ExcavationHotspot extends NamespacedObject {
	constructor(namespace, data, game) {
		super(namespace, data.id);
		this._name = data.name;
		this._media = data.media;
		this.currentHP = 0;
		this.maxHP = data.hitpoints;
		this.level = data.level;
		this.hitpoints = data.hitpoints;
		this.baseExperienceSuccess = data.baseExperienceSuccess;
		this.baseExperienceFailure = data.baseExperienceFailure;
		this.baseExperienceArtefact = data.baseExperienceArtefact;
		this.baseMinInterval = data.baseMinInterval;
		this.baseMaxInterval = data.baseMaxInterval;
		this.currentInterval = undefined;
		this.soil = game.items.getObjectByID(data.soil);
		this.materialDropTable = new DropTable(game, data.materialDropTable);
		this.artefactDropTable = new DropTable(game, data.artefactDropTable);
	}

	get name() {
		return this._name.replace("&apos;", "'");
	}

	get media() {
		return this.getMediaURL(this._media);
	}
}