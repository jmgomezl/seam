import {gate,parseHypotheses,type Route} from './privacy.ts';
import {promptFor,type Boundary} from './engine.ts';
export function firebaseConfigured(){const e=import.meta.env;return ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID','VITE_RECAPTCHA_SITE_KEY'].every(k=>!!e[k]);}
let initialized:Promise<import('firebase/app').FirebaseApp>|undefined;
export async function review(c:Boundary,route:Route,consent:boolean,cloudConsent:boolean){
 gate(route,consent,cloudConsent);
 const e=import.meta.env;
 const required=['VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID','VITE_RECAPTCHA_SITE_KEY'];
 if(required.some(k=>!e[k]))throw new Error('Firebase is not configured. No inference was attempted.');
 if(route==='cloud'&&!e.VITE_FIREBASE_MODEL)throw new Error('Choose an authorized cloud model before requesting inference.');
 if(!initialized)initialized=(async()=>{const {initializeApp}=await import('firebase/app');const {initializeAppCheck,ReCaptchaEnterpriseProvider}=await import('firebase/app-check');const app=initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,projectId:e.VITE_FIREBASE_PROJECT_ID,appId:e.VITE_FIREBASE_APP_ID});initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(e.VITE_RECAPTCHA_SITE_KEY),isTokenAutoRefreshEnabled:true});return app;})();
 const app=await initialized;const {getAI,getGenerativeModel,GoogleAIBackend,InferenceMode,InferenceSource}=await import('firebase/ai');
 // Strict modes prevent payload fallback; inferenceSource below is only a post-request check.
 const model=getGenerativeModel(getAI(app,{backend:new GoogleAIBackend()}),{mode:route==='local'?InferenceMode.ONLY_ON_DEVICE:InferenceMode.ONLY_IN_CLOUD,...(e.VITE_FIREBASE_MODEL?{inCloudParams:{model:e.VITE_FIREBASE_MODEL}}:{})});
 if(route==='local')await model.initializeDeviceModel();
 const result=await model.generateContent(promptFor(c));
 const expectedSource=route==='local'?InferenceSource.ON_DEVICE:InferenceSource.IN_CLOUD;
 if(result.response.inferenceSource!==expectedSource)throw new Error('Unexpected inference route; response rejected.');
 return {source:result.response.inferenceSource,hypotheses:parseHypotheses(result.response.text(),c.id)};
}
