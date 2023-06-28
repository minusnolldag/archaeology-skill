const { patch } = mod.getContext(import.meta);

patch(PetManager, "petPet").replace(function(o, pet) {
	if (pet.id == "archaeology_skill:Digger") {
		imageNotify(pet.media, templateLangString("COMPLETION_LOG_PETS_Pet_Digger", {
			petName: pet.name
		}), "success");
	} else {
		imageNotify(pet.media, templateLangString("COMPLETION_LOG_PETS_Pet", {
			petName: pet.name
		}), "success");

		if (pet.id === "melvorD:CoolRock") {
			this.game.combat.player.pets++;
		}
	}
});