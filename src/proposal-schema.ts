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
