import { Devvit } from '@devvit/public-api';

// Add secrets for supabase config
Devvit.addSettings([
  {
    // Name of the setting which is used to retrieve the setting value
    name: 'supabase_url',
    // This label is used to provide more information in the CLI
    label: 'supabase api url',
    // Type of the setting value
    type: 'string',
    // Marks a setting as sensitive info - all secrets are encrypted
    isSecret: true,
    // Defines the access scope
    // app-scope ensures only developers can create/replace secrets via CLI
    scope: 'app',
  },
  {
    // Name of the setting which is used to retrieve the setting value
    name: 'supabase_api_key',
    // This label is used to provide more information in the CLI
    label: 'supabase service key',
    // Type of the setting value
    type: 'string',
    // Marks a setting as sensitive info - all secrets are encrypted
    isSecret: true,
    // Defines the access scope
    // app-scope ensures only developers can create/replace secrets via CLI
    scope: 'app',
  },
]);
