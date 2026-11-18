import type {Route} from './privacy.ts';
export const REQUIRED_FIREBASE_FIELDS=['VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID','VITE_RECAPTCHA_SITE_KEY'] as const;
export function missingFirebaseFields(env:Record<string,unknown>){return REQUIRED_FIREBASE_FIELDS.filter(key=>typeof env[key]!=='string'||!(env[key] as string).trim());}
export function assertRuntimeConfigured(env:Record<string,unknown>,route:Route){
 const missing=missingFirebaseFields(env);
 if(missing.length)throw new Error(`Firebase configuration missing: ${missing.join(', ')}. No inference was attempted.`);
 if(route==='cloud'&&(typeof env.VITE_FIREBASE_MODEL!=='string'||!env.VITE_FIREBASE_MODEL.trim()))throw new Error('Choose an authorized cloud model before requesting inference.');
}
