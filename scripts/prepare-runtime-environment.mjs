import { readFile, writeFile } from "node:fs/promises";

if (process.env.RUNTIME_SECRET_ARN) {
  const source = await readFile('.env.production', 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  const publicKeys = /^(NEXT_PUBLIC_[A-Z0-9_]+|RUNTIME_SECRET_ARN|RUNTIME_SECRET_REGION|LEGACY_REDIRECT_ORIGIN|LEGACY_REDIRECT_HOST|ADMIN_EMAIL|ACADEMY_ADMIN_EMAIL|STUDIO_ADMIN_EMAIL|TREATMENT_IMAGES_REGION|TREATMENT_IMAGES_BUCKET|LEARNER_FILES_REGION|LEARNER_FILES_BUCKET|TWILIO_ACCOUNT_SID|TWILIO_PHONE_NUMBER|ENQUIRY_FROM_EMAIL|NOTIFICATION_FROM_EMAIL|INSTAGRAM_WEST_STREET_ACCOUNT_ID|INSTAGRAM_WATLINGTON_STREET_ACCOUNT_ID|GOOGLE_WEST_STREET_PLACE_ID|GOOGLE_WATLINGTON_STREET_PLACE_ID)=/;
  await writeFile('.env.production', source.split('\n').filter(line => publicKeys.test(line)).join('\n') + '\n', { mode: 0o600 });
}
