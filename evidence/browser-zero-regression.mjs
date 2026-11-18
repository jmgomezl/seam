// Reconstructed miniature. Expected failure for a disagreement; not an upstream integration test.
import assert from 'node:assert/strict';
const analyze = function analyze(s) {
  let expected = null, observed = null, missing = [], reason = "", declared;
  if (s.kind === "amount") {
    if (!Number.isFinite(s.value)) missing.push("finite amount");
    if (s.producerScale === null || !Number.isFinite(s.producerScale) || s.producerScale <= 0) missing.push("producer units");
    if (s.consumerScale === null || !Number.isFinite(s.consumerScale) || s.consumerScale <= 0) missing.push("consumer units");
    if (!s.producerCurrency || !s.consumerCurrency) missing.push("currency");
    if (!missing.length) {
      expected = { value: s.value / s.producerScale, currency: s.producerCurrency };
      observed = { value: s.value / s.consumerScale, currency: s.consumerCurrency };
    }
    if (s.producerCurrency && s.consumerCurrency && s.producerCurrency !== s.consumerCurrency) {
      declared = "mismatch";
      reason = "Known currencies disagree. Missing scale can limit impact calculation, not erase this conflict.";
    } else if (s.producerScale !== null && s.consumerScale !== null && s.producerScale > 0 && s.consumerScale > 0 && Number.isFinite(s.producerScale) && Number.isFinite(s.consumerScale) && s.producerScale !== s.consumerScale) {
      declared = "mismatch";
      reason = "Declared wire units per major unit differ, including when a zero sample masks the difference.";
    }
  } else if (s.kind === "patch") {
    const actual = s.input === "absent" && s.serializeAbsentAsNull ? "null" : s.input;
    const meaning = (input, absent, nil) => input === "value" ? s.value : (input === "absent" ? absent : nil) === "clear" ? null : s.previous;
    expected = meaning(s.input, s.producerAbsent, s.producerNull);
    observed = meaning(actual, s.consumerAbsent, s.consumerNull);
    if (s.input === "value" && typeof s.value !== "string") missing.push("patch value");
  } else if (s.kind === "time") {
    const match = s.value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/);
    const base = match ? Date.parse(match[1] + (match[2] || "") + "Z") : NaN;
    if (!match || !Number.isFinite(base) || new Date(base).toISOString().slice(0, 19) !== match[1]) missing.push("valid ISO timestamp");
    else if (match[3]) {
      const instant = Date.parse(s.value);
      if (!Number.isFinite(instant)) missing.push("valid explicit offset");
      else expected = observed = instant;
    } else {
      if (s.producerOffset === null || !Number.isFinite(s.producerOffset) || Math.abs(s.producerOffset) > 840) missing.push("producer offset");
      if (s.consumerOffset === null || !Number.isFinite(s.consumerOffset) || Math.abs(s.consumerOffset) > 840) missing.push("consumer offset");
      if (!missing.length) {
        expected = base - s.producerOffset * 6e4;
        observed = base - s.consumerOffset * 6e4;
      }
    }
  } else {
    if (!s.producerMeaning || !s.consumerMeaning) missing.push("state semantics");
    else {
      expected = s.producerMeaning;
      observed = s.consumerMeaning;
    }
  }
  const sampleVerdict = missing.length ? "ambiguous" : JSON.stringify(expected) === JSON.stringify(observed) ? "aligned" : "mismatch";
  const verdict = declared ?? sampleVerdict;
  reason ||= verdict === "ambiguous" ? "Evidence needed to decide is missing." : verdict === "aligned" ? "The interpretations agree for this supplied operation." : "The supplied operation produces different interpretations.";
  return { verdict, sampleVerdict, expected, observed, missing, reason, counterexample: s.kind === "amount" && verdict === "mismatch" && sampleVerdict === "aligned" ? { ...s, value: 1 } : null, scope: "Reconstructed miniature only. No original project or live integration was tested." };
};
const result = analyze({"kind":"amount","value":0,"producerScale":100,"consumerScale":1,"producerCurrency":"USD","consumerCurrency":"USD"});
if(result.verdict==='ambiguous') throw new Error('Insufficient evidence');
assert.equal(result.verdict,'aligned',result.reason);
console.log('Reconstructed fixture agrees');
