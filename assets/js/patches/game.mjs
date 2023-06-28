const { patch } = mod.getContext(import.meta);

patch(Game, "runTicks").replace(function(o, ticksToRun) {
	const startTimeStamp = performance.now();
	let ticksRan = 0;

	for (let i = 0; i < ticksToRun; i++) {
		if (ticksRan == 600) {
			this.archaeology.showNotifications = false;
		}

		this.tick();
		ticksRan++;
	}

	this.archaeology.showNotifications = true;

	if (ticksToRun > 72000) {
		const processingTime = performance.now() - startTimeStamp;

		console.log(`Took ${processingTime / 1000}s to process ${ticksToRun} ticks. ${processingTime / ticksToRun}ms per tick.`);
	}
});