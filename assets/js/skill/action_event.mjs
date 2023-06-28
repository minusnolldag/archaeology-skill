export class ArchaeologyActionEvent extends SkillActionEvent {
	constructor(skill, action) {
		super();
		this.skill = skill;
		this.action = action;
		this.activePotion = skill.activePotion;
	}
}

export class ArchaeologyActionEventMatcher extends SkillActionEventMatcher {
	constructor(options, game) {
		super(options, game);

		if (options.actionIDs !== undefined) {
			this.actions = game.archaeology.actions.getSetForConstructor(options.actionIDs, this, ExcavationHotspot.name);
		}
	}

	doesEventMatch(event) {
		return (event instanceof ArchaeologyActionEvent && (this.actions === undefined || isAnySetMemberInSet(this.actions, event.actions)) && super.doesEventMatch(event));
	}
}