export class ArchaeologySelectionTab extends ItemRecipeSelectionTab {
	constructor(category) {
		const recipes = game.archaeology.actions.filter((recipe) => {
			if (recipe.category === category) {
				return recipe;
			}
		});

		recipes.sort((a, b) => a.level - b.level);

		super(`archaeology-workbench-recipes-container`, game.archaeology, recipes, `archaeology-category-${category.id}`, "lg");
		this.hide();
	}

	getRecipeName(recipe) {
		return recipe.name.replace("&apos;", "'");
	}

	getRecipeMedia(recipe) {
		return recipe.media;
	}

	getRecipeIngredients(recipe) {
		//console.log("TODO FIX");
		//console.log(game.archaeology.getRecipeCosts(recipe));
		// call updateRecipeTooltips when the cost changes.

		return game.archaeology.getRecipeCosts(recipe);
	}

	updateRecipesForLevel() {
		super.updateRecipesForLevel();
	}

	getRecipeCallback(recipe) {
		return () => game.archaeology.selectRecipeOnClick(recipe);
	}
}