import { generateCert } from '../lib/cert.js';

export default async function action(options: { output: string }) {
  const { output } = options;

  console.group('🍳 Generate SSL key for localhost');
  try {
    const { stdout } = await generateCert(output);
    console.log(stdout);
    console.log(`🔑 key generation success. Output to ${output}.`);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
