"use client";

import { useState, useEffect } from "react";
import { SCENARIOS, ICON_PATHS, type QuestionDef } from "@/lib/scenarios";
import { buildQuestions, choiceOptions, copyQuestion, MAX_CHOICE_OPTIONS, MAX_SCORE_LEVELS, scoreLevels, validateQuestions, yesNoCriteria } from "@/lib/question-config";
import { signIn, useSession } from "next-auth/react";

interface AnswerNoul {
  type: "noul";
  noul: number;
}
interface AnswerChoice {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}
interface AnswerScore {
  type: "score";
  score: number;
  confidence: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
}
type JevAnswer = AnswerNoul | AnswerChoice | AnswerScore;

interface RunResponse {
  model?: string;
  answers?: Record<string, JevAnswer>;
  usage?: { input_tokens: number; output_tokens: number };
  error?: string;
}

const BAR_COLORS = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--c3)", "var(--muted)"];

// Demo answers per scenario key — matches the questions of each scenario
const DEMO_ANSWERS: Record<string, RunResponse> = {
  pitch: {
    model: "jev-latest",
    answers: {
      decision: { type: "choice", choice: "submit", confidence: 0.78, probabilities: { submit: 0.78, review: 0.18, skip: 0.04 } },
      fit: { type: "score", score: 3.5, confidence: 0.84, legend: {}, probabilities: { "0": 0.02, "1": 0.05, "2": 0.12, "3": 0.28, "4": 0.35, "5": 0.18 } },
      risk: { type: "noul", noul: 0.22 },
    },
    usage: { input_tokens: 412, output_tokens: 86 },
  },
  candidate: {
    model: "jev-latest",
    answers: {
      skills: { type: "noul", noul: 0.91 },
      relevance: { type: "score", score: 4.2, confidence: 0.88, legend: {}, probabilities: { "0": 0.01, "1": 0.03, "2": 0.06, "3": 0.15, "4": 0.35, "5": 0.40 } },
      next: { type: "choice", choice: "interview", confidence: 0.82, probabilities: { interview: 0.82, shortlist: 0.12, hold: 0.04, pass: 0.02 } },
    },
    usage: { input_tokens: 389, output_tokens: 92 },
  },
  chat: {
    model: "jev-latest",
    answers: {
      intent: { type: "choice", choice: "account access", confidence: 0.96, probabilities: { "account access": 0.96, billing: 0.02, "feature request": 0.01, other: 0.01 } },
      today: { type: "noul", noul: 0.97 },
      impact: { type: "score", score: 4.5, confidence: 0.91, legend: {}, probabilities: { "0": 0.01, "1": 0.02, "2": 0.03, "3": 0.08, "4": 0.25, "5": 0.61 } },
    },
    usage: { input_tokens: 298, output_tokens: 78 },
  },
  support: {
    model: "jev-latest",
    answers: {
      team: { type: "choice", choice: "billing", confidence: 0.93, probabilities: { billing: 0.93, technical: 0.04, sales: 0.01, account: 0.02 } },
      today: { type: "noul", noul: 0.99 },
      frustration: { type: "score", score: 4.6, confidence: 0.94, legend: {}, probabilities: { "0": 0.0, "1": 0.01, "2": 0.02, "3": 0.05, "4": 0.22, "5": 0.70 } },
    },
    usage: { input_tokens: 445, output_tokens: 95 },
  },
  moderation: {
    model: "jev-latest",
    answers: {
      violation: { type: "noul", noul: 0.35 },
      action: { type: "choice", choice: "warn", confidence: 0.61, probabilities: { leave: 0.28, warn: 0.61, hide: 0.09, ban: 0.02 } },
      toxicity: { type: "score", score: 2.8, confidence: 0.77, legend: {}, probabilities: { "0": 0.08, "1": 0.22, "2": 0.35, "3": 0.22, "4": 0.09, "5": 0.04 } },
    },
    usage: { input_tokens: 310, output_tokens: 82 },
  },
  intent: {
    model: "jev-latest",
    answers: {
      user_goal: { type: "choice", choice: "update email", confidence: 0.95, probabilities: { "update email": 0.95, "reset password": 0.02, billing: 0.02, other: 0.01 } },
      self_serve: { type: "noul", noul: 0.88 },
      urgency: { type: "score", score: 1.8, confidence: 0.72, legend: {}, probabilities: { "0": 0.15, "1": 0.40, "2": 0.28, "3": 0.12, "4": 0.04, "5": 0.01 } },
    },
    usage: { input_tokens: 287, output_tokens: 74 },
  },
  review: {
    model: "jev-latest",
    answers: {
      severity: { type: "score", score: 3.8, confidence: 0.85, legend: {}, probabilities: { "0": 0.02, "1": 0.06, "2": 0.10, "3": 0.22, "4": 0.35, "5": 0.25 } },
      issue_type: { type: "choice", choice: "durability", confidence: 0.55, probabilities: { durability: 0.55, "customer support": 0.35, price: 0.07, other: 0.03 } },
      follow_up: { type: "noul", noul: 0.79 },
    },
    usage: { input_tokens: 356, output_tokens: 88 },
  },
  lead: {
    model: "jev-latest",
    answers: {
      buying_intent: { type: "score", score: 4.3, confidence: 0.89, legend: {}, probabilities: { "0": 0.01, "1": 0.02, "2": 0.05, "3": 0.12, "4": 0.30, "5": 0.50 } },
      timeline: { type: "noul", noul: 0.84 },
      next_step: { type: "choice", choice: "book discovery", confidence: 0.76, probabilities: { "book discovery": 0.76, nurture: 0.20, pass: 0.04 } },
    },
    usage: { input_tokens: 334, output_tokens: 79 },
  },
  guardrail: {
    model: "jev-latest",
    answers: {
      jailbreak: { type: "noul", noul: 0.98 },
      block: { type: "noul", noul: 0.99 },
      attack_type: { type: "choice", choice: "prompt injection", confidence: 0.71, probabilities: { "prompt injection": 0.71, "phishing generation": 0.22, "data exfiltration": 0.04, other: 0.03 } },
    },
    usage: { input_tokens: 267, output_tokens: 71 },
  },
  citation: {
    model: "jev-latest",
    answers: {
      supported: { type: "noul", noul: 0.18 },
      match: { type: "score", score: 1.2, confidence: 0.81, legend: {}, probabilities: { "0": 0.45, "1": 0.30, "2": 0.15, "3": 0.06, "4": 0.03, "5": 0.01 } },
      action: { type: "choice", choice: "reject claim", confidence: 0.68, probabilities: { "reject claim": 0.68, "soften wording": 0.22, "flag for author": 0.08, "keep as-is": 0.02 } },
    },
    usage: { input_tokens: 291, output_tokens: 76 },
  },
  own: {
    model: "jev-latest",
    answers: {
      act_today: { type: "noul", noul: 0.62 },
      path: { type: "choice", choice: "option A", confidence: 0.55, probabilities: { "option A": 0.55, "option B": 0.33, "option C": 0.12 } },
      confidence: { type: "score", score: 3.0, confidence: 0.68, legend: {}, probabilities: { "0": 0.05, "1": 0.12, "2": 0.20, "3": 0.28, "4": 0.22, "5": 0.13 } },
    },
    usage: { input_tokens: 245, output_tokens: 68 },
  },
};

export default function Playground() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const [activeIdx, setActiveIdx] = useState(0);
  const [text, setText] = useState(SCENARIOS[0].text);
  const [questions, setQuestions] = useState<QuestionDef[]>(
    SCENARIOS[0].questions.map(copyQuestion)
  );
  const [questionsEdited, setQuestionsEdited] = useState(false);
  const [openQ, setOpenQ] = useState(-1);
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState<RunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    if (!isAuthed) return;
    fetch("/api/usage").then(r => r.json()).then(d => {
      if (d.authed) { setRemaining(d.totalRemaining); window.dispatchEvent(new Event("credits-updated")); }
    }).catch(() => {});
  }, [isAuthed]);

  const scenario = SCENARIOS[activeIdx];

  const selectScenario = (idx: number) => {
    setActiveIdx(idx);
    setText(SCENARIOS[idx].text);
    setQuestions(SCENARIOS[idx].questions.map(copyQuestion));
    setQuestionsEdited(false);
    setOpenQ(-1);
    setAnswers(null);
    setError(null);
  };

  const editQuestions = (update: (current: QuestionDef[]) => QuestionDef[]) => {
    setQuestions(update);
    setQuestionsEdited(true);
    setAnswers(null);
    setError(null);
  };

  const addQuestion = (type: QuestionDef["type"]) => {
    const id = `q_${Date.now()}`;
    const base: QuestionDef = {
      id,
      type,
      instructions: type === "noul" ? "Is this true?" : "What should we decide?",
    };
    if (type === "choice") {
      base.choiceOptions = [
        { label: "Option A", description: "When option A applies" },
        { label: "Option B", description: "When option B applies" },
      ];
    } else if (type === "score") {
      base.criteria = ["Low: little evidence", "Medium: mixed evidence", "High: strong evidence"];
    }
    editQuestions((current) => [...current, base]);
    setOpenQ(questions.length);
  };

  const removeQuestion = (idx: number) => {
    editQuestions((current) => current.filter((_, i) => i !== idx));
    if (openQ >= questions.length - 1) setOpenQ(-1);
  };

  const updateQuestionText = (idx: number, val: string) => {
    editQuestions((current) => current.map((q, i) => i === idx ? { ...q, instructions: val } : q));
  };

  const updateYesNoDefinition = (idx: number, answer: "true" | "false", value: string) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, criteria: { ...yesNoCriteria(q), [answer]: value } }
      : q));
  };

  const updateChoiceOption = (idx: number, optionIdx: number, field: "label" | "description", value: string) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, choiceOptions: choiceOptions(q).map((option, j) => j === optionIdx ? { ...option, [field]: value } : option) }
      : q));
  };

  const addChoiceOption = (idx: number) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, choiceOptions: [...choiceOptions(q), { label: "", description: "" }] }
      : q));
  };

  const removeChoiceOption = (idx: number, optionIdx: number) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, choiceOptions: choiceOptions(q).filter((_, j) => j !== optionIdx) }
      : q));
  };

  const updateScoreLevel = (idx: number, levelIdx: number, value: string) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, criteria: scoreLevels(q).map((level, j) => j === levelIdx ? value : level) }
      : q));
  };

  const addScoreLevel = (idx: number) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, criteria: [...scoreLevels(q), ""] }
      : q));
  };

  const removeScoreLevel = (idx: number, levelIdx: number) => {
    editQuestions((current) => current.map((q, i) => i === idx
      ? { ...q, criteria: scoreLevels(q).filter((_, j) => j !== levelIdx) }
      : q));
  };

  const buildRequest = () => {
    return {
      state: text,
      model: "jev-latest",
      questions: buildQuestions(questions),
    };
  };

  const runJev = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    const questionError = validateQuestions(questions);
    if (questionError) {
      setError(questionError);
      return;
    }
    if (!isAuthed) {
      signIn("google");
      return;
    }
    setRunning(true);
    setError(null);
    setAnswers(null);
    setExhausted(false);
    try {
      const res = await fetch("/api/systemone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest()),
      });
      const data: RunResponse & { code?: string } = await res.json();
      if (!res.ok || data.error) {
        if (data.code === "QUOTA_EXHAUSTED") {
          setExhausted(true);
          setRemaining(0);
        }
        setError(data.error || `Request failed (${res.status})`);
      } else {
        setAnswers(data);
        fetch("/api/usage").then(r => r.json()).then(d => {
          if (d.authed) { setRemaining(d.totalRemaining); window.dispatchEvent(new Event("credits-updated")); }
        }).catch(() => {});
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => selectScenario(activeIdx);

  const qTypeBadge = (type: QuestionDef["type"]) => {
    const label = type === "noul" ? "Yes / No" : type === "choice" ? "Choice" : "Score";
    const cls = type === "noul" ? "yesno" : type;
    return <span className={`qtype ${cls}`}>{label}</span>;
  };

  return (
    <section className="pg shell" id="playground">
      <div className="pg-head">
        <div>
          <h2>Playground</h2>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.92rem" }}>
            Pick a scenario, edit the questions, hit Run Jev.
          </p>
        </div>
        <span className="badge">Live · Jev model</span>
      </div>

      {/* scenario tabs */}
      <div className="demo-grid">
        {SCENARIOS.slice(0, 3).map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`demo-tab${i === activeIdx ? " active" : ""}`}
            onClick={() => selectScenario(i)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: ICON_PATHS[s.icon] || "" }}
            />
            {s.name}
          </button>
        ))}
      </div>

      <div className="pg-layout">
        {/* left: input panel */}
        <div className="panel">
          <h3>
            {scenario.name}
            {scenario.subtitle ? ` — ${scenario.subtitle}` : ""}
          </h3>

          <label className="step-label">
            <span className="step-num">1</span> Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={50000}
          />
          <div className="char-count">{text.length} / 50,000</div>

          <label className="step-label">
            <span className="step-num">2</span> Questions
          </label>
          <div className="q-list">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={`qrow${i === openQ ? " open" : ""}`}
              >
                <button
                  className="qsummary"
                  type="button"
                  onClick={() => setOpenQ(openQ === i ? -1 : i)}
                >
                  {qTypeBadge(q.type)}
                  <span className="qtext">{q.instructions}</span>
                  <span className="qacts">
                    <span className="qicon del" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </span>
                  </span>
                </button>
                <div className="qedit">
                  <label>Question</label>
                  <input
                    type="text"
                    value={q.instructions}
                    onChange={(e) => updateQuestionText(i, e.target.value)}
                  />
                  {q.type === "noul" && (
                    <>
                      <p className="criteria-help">Optional: explain exactly what counts as Yes and No.</p>
                      <label htmlFor={`${q.id}-yes`}>Yes means</label>
                      <input
                        id={`${q.id}-yes`}
                        type="text"
                        placeholder="What evidence makes the answer Yes?"
                        value={yesNoCriteria(q).true}
                        onChange={(e) => updateYesNoDefinition(i, "true", e.target.value)}
                      />
                      <label htmlFor={`${q.id}-no`}>No means</label>
                      <input
                        id={`${q.id}-no`}
                        type="text"
                        placeholder="What evidence makes the answer No?"
                        value={yesNoCriteria(q).false}
                        onChange={(e) => updateYesNoDefinition(i, "false", e.target.value)}
                      />
                    </>
                  )}
                  {q.type === "choice" && (
                    <>
                      <p className="criteria-help">Name each option and describe when Jev should choose it.</p>
                      <div className="criteria-list">
                        {choiceOptions(q).map((option, optionIdx) => (
                          <div className="criteria-row" key={optionIdx}>
                            <input
                              type="text"
                              aria-label={`Choice ${optionIdx + 1} name`}
                              placeholder="Option name"
                              value={option.label}
                              onChange={(e) => updateChoiceOption(i, optionIdx, "label", e.target.value)}
                            />
                            <input
                              type="text"
                              aria-label={`Choice ${optionIdx + 1} definition`}
                              placeholder="When should Jev pick this?"
                              value={option.description}
                              onChange={(e) => updateChoiceOption(i, optionIdx, "description", e.target.value)}
                            />
                            <button
                              className="criteria-remove"
                              type="button"
                              aria-label={`Remove choice ${optionIdx + 1}`}
                              disabled={choiceOptions(q).length <= 2}
                              onClick={() => removeChoiceOption(i, optionIdx)}
                            >×</button>
                          </div>
                        ))}
                      </div>
                      <button
                        className="criteria-add"
                        type="button"
                        disabled={choiceOptions(q).length >= MAX_CHOICE_OPTIONS}
                        onClick={() => addChoiceOption(i)}
                      >+ Add option</button>
                    </>
                  )}
                  {q.type === "score" && (
                    <>
                      <p className="criteria-help">Define 2–10 ordered levels, from lowest (0) to highest.</p>
                      <div className="criteria-list">
                        {scoreLevels(q).map((level, levelIdx) => (
                          <div className="criteria-row score-level" key={levelIdx}>
                            <span className="criteria-index">{levelIdx}</span>
                            <input
                              type="text"
                              aria-label={`Score level ${levelIdx} definition`}
                              placeholder={`What does level ${levelIdx} mean?`}
                              value={level}
                              onChange={(e) => updateScoreLevel(i, levelIdx, e.target.value)}
                            />
                            <button
                              className="criteria-remove"
                              type="button"
                              aria-label={`Remove score level ${levelIdx}`}
                              disabled={scoreLevels(q).length <= 2}
                              onClick={() => removeScoreLevel(i, levelIdx)}
                            >×</button>
                          </div>
                        ))}
                      </div>
                      <button
                        className="criteria-add"
                        type="button"
                        disabled={scoreLevels(q).length >= MAX_SCORE_LEVELS}
                        onClick={() => addScoreLevel(i)}
                      >+ Add level</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="qrow-add">
            <button className="qadd" onClick={() => addQuestion("noul")}>+ Yes / No</button>
            <button className="qadd" onClick={() => addQuestion("choice")}>+ Choice</button>
            <button className="qadd" onClick={() => addQuestion("score")}>+ Score</button>
          </div>

          <div className="pg-actions">
            <button className="btn btn-primary" onClick={runJev} disabled={running}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              {running ? "Running…" : isAuthed ? "Run Jev" : "Sign in to Run Jev"}
            </button>
            <button className="btn btn-ghost" onClick={reset}>Reset</button>
            {isAuthed && remaining !== null && (
              <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: "var(--muted)" }}>
                {remaining} runs left
              </span>
            )}
          </div>
        </div>

        {/* right: answers panel */}
        <div className="panel">
          <div className="ans-head">
            <h3>Answers</h3>
            <span className="ans-status">
              {running ? "Running…" : answers ? "Done" : "Ready"}
            </span>
          </div>
          <div className="ans-list">
            {exhausted && (
              <div className="ans-card" style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>You&apos;ve used all 5 free runs</div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 16 }}>
                  Upgrade to Pro for unlimited runs and saved history.
                </p>
                <a href="/pricing" className="btn btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                  View pricing
                </a>
              </div>
            )}
            {error && !exhausted && (
              <div className="ans-card" style={{ color: "var(--danger)" }}>
                Error: {error}
              </div>
            )}
            {!answers && !error && !running && (
              <>
                {(!questionsEdited && DEMO_ANSWERS[scenario.key]?.answers
                  ? questions.map((q) => {
                      const a = DEMO_ANSWERS[scenario.key].answers?.[q.id];
                      if (!a) return null;
                      if (a.type === "noul") return <NoulCard key={q.id} q={q.instructions} a={a} />;
                      if (a.type === "choice") return <ChoiceCard key={q.id} q={q.instructions} a={a} />;
                      return <ScoreCard key={q.id} q={q.instructions} a={a} />;
                    })
                  : null)}
                <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", marginTop: 12 }}>
                  {questionsEdited
                    ? "Your questions have changed. Run Jev to see answers for your definitions."
                    : "← Example results. Press Run Jev to get real answers."}
                </p>
              </>
            )}
            {running && (
              <div
                className="ans-card"
                style={{
                  textAlign: "center",
                  color: "var(--muted)",
                  padding: "40px 20px",
                }}
              >
                Jev is thinking…
              </div>
            )}
            {answers?.answers &&
              questions.map((q) => {
                const a = answers.answers?.[q.id];
                if (!a) return null;
                if (a.type === "noul") return <NoulCard key={q.id} q={q.instructions} a={a} />;
                if (a.type === "choice") return <ChoiceCard key={q.id} q={q.instructions} a={a} />;
                return <ScoreCard key={q.id} q={q.instructions} a={a} />;
              })}
          </div>
          {answers?.usage && (
            <div className="ans-foot">
              {answers.model} · {answers.usage.input_tokens} input tokens ·{" "}
              {answers.usage.output_tokens} output tokens
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function NoulCard({ q, a }: { q: string; a: AnswerNoul }) {
  const pct = Math.round(a.noul * 100);
  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c * (1 - a.noul);
  const verdict = a.noul >= 0.5 ? "Yes" : "No";
  return (
    <div className="ans-card">
      <div className="ans-top">
        <span className="qtype yesno">Yes / No</span>
        <span className="ans-q">{q}</span>
      </div>
      <div className="ans-visual">
        <div className="gauge-wrap">
          <div style={{ width: 90, height: 90, position: "relative", flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
              <circle cx="45" cy="45" r={r} fill="none" stroke="var(--paper-3)" strokeWidth="8" />
              <circle
                cx="45" cy="45" r={r} fill="none"
                stroke="var(--mint)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={off}
              />
            </svg>
            <span className="gauge-pct" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{pct}%</span>
          </div>
          <div>
            <div className="gauge-verdict">{verdict} · {pct}%</div>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 3 }}>
              Calibrated probability
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({ q, a }: { q: string; a: AnswerChoice }) {
  const entries = Object.entries(a.probabilities).sort((x, y) => y[1] - x[1]);
  return (
    <div className="ans-card">
      <div className="ans-top">
        <span className="qtype choice">Choice</span>
        <span className="ans-q">{q}</span>
      </div>
      <div className="ans-visual">
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8 }}>
          {a.choice} · <span style={{ color: "var(--accent)" }}>{Math.round(a.confidence * 100)}%</span>
        </div>
        {entries.map(([label, prob], i) => (
          <div className="ans-row" key={label}>
            <span className="lbl">{label}</span>
            <span className="track">
              <i style={{ width: `${Math.round(prob * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
            </span>
            <span className="val">{Math.round(prob * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ q, a }: { q: string; a: AnswerScore }) {
  const keys = Object.keys(a.probabilities).sort((x, y) => Number(x) - Number(y));
  const maxKey = Number(keys[keys.length - 1] || 5);
  const minKey = Number(keys[0] || 0);
  const range = maxKey - minKey || 1;
  const pct = ((a.score - minKey) / range) * 100;
  return (
    <div className="ans-card">
      <div className="ans-top">
        <span className="qtype score">Score</span>
        <span className="ans-q">{q}</span>
      </div>
      <div className="ans-visual">
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: "1.4rem" }}>
            {a.score.toFixed(1)}
          </span>
          <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            out of {maxKey}
          </span>
          <span style={{ fontSize: "0.82rem", color: "var(--ink-2)", fontWeight: 600, marginLeft: "auto" }}>
            confidence {Math.round(a.confidence * 100)}%
          </span>
        </div>
        <div className="scale">
          <div className="pin" style={{ left: `${Math.max(0, Math.min(100, pct))}%` }} />
        </div>
        <div className="scale-labels">
          <span>{minKey}</span>
          <span>{maxKey}</span>
        </div>
      </div>
    </div>
  );
}
