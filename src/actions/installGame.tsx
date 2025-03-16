import type { AppUpgradeDefinition } from "@devvit/public-api";
import { Devvit } from "@devvit/public-api";

import { Service } from "../service/service.js";

export const dailyPostTrigger: AppUpgradeDefinition = {
  event: "AppUpgrade",
  onEvent: async (_, context) => {
    // Set up phrase bank
    const service = new Service(context);

    // TODO: populate with real phrases
    await service.upsertPhraseBank("default", [
      "majjie",
      "majjico",
      "viva italia",
      "lego jesus bless",
    ]);
  },
};
