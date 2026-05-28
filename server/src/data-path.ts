import { join } from 'path';

export function getDataDir() {
  if (process.env.VERCEL) return '/tmp/data';
  return join(process.cwd(), 'data');
}

export function getDataFile(name: string) {
  return join(getDataDir(), name);
}
