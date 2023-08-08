AddAshesScatteredToStatsPage();

function AddAshesScatteredToStatsPage() {
	let itemStatsLength = GetStatLength(ItemStats);
	let prayerStatsLength = GetStatLength(PrayerStats);

	ItemStats[ItemStats["TimesScattered"] = itemStatsLength] = "TimesScattered";
	PrayerStats[PrayerStats["AshesScattered"] = prayerStatsLength] = "AshesScattered";
	statsData.forEach((statData) => {
		if (statData.tableID == "prayer-stats-table") {
			statData.rows[statData.rows.length] = {
				get name() {
					return getLangString("STATISTICS_TOTAL_ASHES_SCATTERED");
				},
				get value() {
					return game.stats.Prayer.get(PrayerStats.AshesScattered);
				},
			};
		}
	});
}

function GetStatLength(stat) {
	let length = 0;

	Object.entries(stat).forEach(j => {
		const [key, value] = j;
	
		if (!isNaN(value)) {
			if (length <= value) {
				length = value + 1;
			}
		}
	});

	return length;
}