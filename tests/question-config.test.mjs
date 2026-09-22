import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestions, copyQuestion, validateQuestions } from "../lib/question-config.ts";

test("Yes/No definitions are optional but sent as true and false when filled", () => {
  const base = { id: "worth_it", type: "noul", instructions: "Is this worth pitching?" };
  assert.equal(validateQuestions([base]), null);
  assert.deepEqual(buildQuestions([base]).worth_it, {
    type: "noul", instructions: "Is this worth pitching?",
  });
  const defined = { ...base, criteria: { true: "Good fit", false: "Poor fit" } };
  assert.equal(validateQuestions([defined]), null);
  assert.deepEqual(buildQuestions([defined]).worth_it.criteria, { true: "Good fit", false: "Poor fit" });
  assert.match(validateQuestions([{ ...base, criteria: { true: "Good fit", false: "" } }]), /both Yes and No/);
});

test("Choice keeps custom labels and definitions, and rejects duplicate labels", () => {
  const question = {
    id: "risk", type: "choice", instructions: "How risky is the client?",
    choiceOptions: [
      { label: "Low", description: "Credible payment and scope" },
      { label: "Medium", description: "Some uncertainty" },
      { label: "High", description: "Clear red flags" },
    ],
  };
  assert.equal(validateQuestions([question]), null);
  assert.deepEqual(buildQuestions([question]).risk.criteria, {
    Low: "Credible payment and scope", Medium: "Some uncertainty", High: "Clear red flags",
  });
  assert.match(validateQuestions([{ ...question, choiceOptions: [...question.choiceOptions, { label: "low", description: "Duplicate" }] }]), /unique/);
});

test("Score sends ordered, custom levels and requires each level to be defined", () => {
  const question = {
    id: "fit", type: "score", instructions: "How well does this fit?",
    criteria: ["Poor fit", "Partial fit", "Strong fit"],
  };
  assert.equal(validateQuestions([question]), null);
  assert.deepEqual(buildQuestions([question]).fit.criteria, ["Poor fit", "Partial fit", "Strong fit"]);
  assert.match(validateQuestions([{ ...question, criteria: ["Poor fit", "", "Strong fit"] }]), /every score level/);
});

test("Editing a copied preset does not mutate the original criteria", () => {
  const original = { id: "choice", type: "choice", instructions: "Choose", criteria: { a: "First", b: "Second" } };
  const copy = copyQuestion(original);
  copy.choiceOptions[0].label = "changed";
  assert.equal(original.criteria.a, "First");
  assert.equal(buildQuestions([copy]).choice.criteria.changed, "First");
});
