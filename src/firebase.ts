import {proposalResponseSchema,localProposalResponseSchema} from './proposal-schema.ts';
import {missingFirebaseFields,assertRuntimeConfigured} from './runtime-readiness.ts';
import {gate,parseHypotheses,type Route} from './privacy.ts';
import {promptFor,type Boundary} from './engine.ts';
export function firebaseConfigured(){return missingFirebaseFields(import.meta.env).length===0;}
let initialized:Promise<import('firebase/app').FirebaseApp>|undefined;
export async function inferText(prompt:string,route:Route,consent:boolean,cloudConsent:boolean,format:'text'|'proposal'='text'){
 gate(route,consent,cloudConsent);
 const e=import.meta.env;
 assertRuntimeConfigured(e,route);
 if(!initialized)initialized=(async()=>{const {initializeApp}=await import('firebase/app');const {initializeAppCheck,ReCaptchaEnterpriseProvider}=await import('firebase/app-check');const app=initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,projectId:e.VITE_FIREBASE_PROJECT_ID,appId:e.VITE_FIREBASE_APP_ID});initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(e.VITE_RECAPTCHA_SITE_KEY),isTokenAutoRefreshEnabled:true});return app;})();
 const app=await initialized;const {getAI,getGenerativeModel,GoogleAIBackend,InferenceMode,InferenceSource,Schema}=await import('firebase/ai');
 // Strict modes prevent payload fallback; inferenceSource below is only a post-request check.
 const schema=format==='proposal'?proposalResponseSchema(Schema):undefined;
 const model=getGenerativeModel(getAI(app,{backend:new GoogleAIBackend()}),{mode:route==='local'?InferenceMode.ONLY_ON_DEVICE:InferenceMode.ONLY_IN_CLOUD,...(route==='local'?{...(schema?{onDeviceParams:{promptOptions:{responseConstraint:localProposalResponseSchema(Schema)}}}:{})}:{inCloudParams:{model:e.VITE_FIREBASE_MODEL,...(schema?{generationConfig:{responseMimeType:'application/json',responseSchema:schema}}:{})}})});
 if(route==='local')await model.initializeDeviceModel();
 const result=await model.generateContent(prompt);
 const expectedSource=route==='local'?InferenceSource.ON_DEVICE:InferenceSource.IN_CLOUD;
 if(result.response.inferenceSource!==expectedSource)throw new Error('Unexpected inference route; response rejected.');
 return {source:result.response.inferenceSource,text:result.response.text()};
}

export async function review(c:Boundary,route:Route,consent:boolean,cloudConsent:boolean){const result=await inferText(promptFor(c),route,consent,cloudConsent);return {source:result.source,hypotheses:parseHypotheses(result.text,c.id)};}
