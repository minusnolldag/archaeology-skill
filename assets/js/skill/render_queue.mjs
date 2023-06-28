export class RenderQueue extends GatheringSkillRenderQueue {
	constructor() {
		super(...arguments);
		this.excavationHotspots = false;
		this.selectedExcavationHotspot = false;
		this.updateExcavationHotspotHP = false;
	}
}