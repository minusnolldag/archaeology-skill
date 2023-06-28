const { loadModule } = mod.getContext(import.meta);
await loadModule("assets/js/patches/game.mjs");
await loadModule("assets/js/patches/player.mjs");
await loadModule("assets/js/patches/pets.mjs");
await loadModule("assets/js/patches/lore.mjs");
await loadModule("assets/js/patches/action_event.mjs");
await loadModule("assets/js/patches/costs.mjs");
await loadModule("assets/js/patches/special_attack.mjs");