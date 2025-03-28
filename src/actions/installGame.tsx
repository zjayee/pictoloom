import type { AppUpgradeDefinition } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { Service } from '../service/service.js';

export const appUpgradeSetup: AppUpgradeDefinition = {
  event: 'AppUpgrade',
  onEvent: async (_, context) => {
    // Clear existing jobs
    context.scheduler.listJobs().then((jobs) => {
      for (const job of jobs) {
        console.log('Cancelling job:', job.id);
        context.scheduler.cancelJob(job.id);
      }
    });

    // Set up phrase bank
    const service = new Service(context);

    // TODO: populate with real phrases
    await service.phraseBank.clearPhraseBank('default');
    await service.phraseBank.upsertPhraseBank('default', [
      'banana DJ',
      'dancing duck',
      'fluffy dog',
      'Robot falling in love',
    ]);
  },
};
