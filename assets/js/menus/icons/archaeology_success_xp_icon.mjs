export class ArchaeologySuccessXPIcon extends XPIcon {
	constructor(parent, xp, size = 48) {
		super(parent, "bg-secondary", size);
		this.xp = xp;
	}

	getTooltipContent(xp) {
		return `<div class="text-center">${templateLangString("MENU_TEXT_TOOLTIP_SKILL_XP", {
			xp: `${xp}`,
		})}<br><small>${getLangString("MENU_TEXT_Success_XP")}</small></div>`;
	}
}