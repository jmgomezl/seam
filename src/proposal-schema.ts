/** SDK schema controls output shape only. Exact quotes and human semantics remain required. */
export function proposalResponseSchema(Schema:typeof import('firebase/ai').Schema){
 const candidate=()=>Schema.object({nullable:true,properties:{
  unitsPerMajor:Schema.integer({description:'Display units per major unit: 1, 100, or 1000. Other values are rejected by the application.'}),
  currency:Schema.string({description:'Three uppercase currency letters supported by the quoted excerpt.'}),
  quote:Schema.string({description:'Exact contiguous supporting quote from this side, at least 10 characters.'})
 }});
 return Schema.object({properties:{
  status:Schema.enumString({enum:['candidate','abstain']}),
  producer:candidate(),consumer:candidate(),
  reason:Schema.string({description:'Brief rationale. Abstain for unsupported or ambiguous semantics.'})
 }});
}

/** Chrome consumes JSON Schema, not OpenAPI's nullable keyword.
 * Convert only our fixed, authored schema; never accept a model-provided schema.
 */
export function localProposalResponseSchema(Schema:typeof import('firebase/ai').Schema):object {
 const schema=JSON.parse(JSON.stringify(proposalResponseSchema(Schema)));
 const convert=(value:any):void=>{
  if(!value||typeof value!=='object')return;
  if(value.nullable===true)value.type=[value.type,'null'];
  delete value.nullable;
  for(const child of Object.values(value))convert(child);
 };
 convert(schema);return schema;
}
