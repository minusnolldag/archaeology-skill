export class ArchaeologyActionEvent extends SkillActionEvent {
	constructor(skill, action) {
		super();
		this.skill = skill;
		this.action = action;
		this.activePotion = skill.activePotion;
	}
}