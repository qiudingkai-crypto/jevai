"use client";

import { useEffect, useRef } from "react";

const DEMO_TEXT =
  "Payouts have failed since Monday. Fix it today or we switch provider.";

export default function HeroAnimation() {
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const qRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const clear = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };

    const n0 = document.getElementById("n0");
    const n1 = document.getElementById("n1");
    const n2 = document.getElementById("n2");
    const b0 = document.getElementById("b0");
    const b1 = document.getElementById("b1");
    const b2 = document.getElementById("b2");

    const countUp = (
      el: HTMLElement | null,
      to: number,
      suffix: string,
      dec = 0
    ) => {
      if (!el) return;
      const start = performance.now();
      const dur = 900;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const finishAll = () => {
      qRef.current?.classList.add("show");
      runRef.current?.classList.add("show");
      outRef.current?.classList.add("show");
      if (b0) b0.style.width = "97%";
      if (b1) b1.style.width = "96%";
      if (b2) b2.style.width = "60%";
      if (n0) n0.textContent = "99%";
      if (n1) n1.textContent = "96%";
      if (n2) n2.textContent = "3.0";
    };

    const goRun = () => {
      outRef.current?.classList.add("show");
      later(() => {
        if (b0) b0.style.width = "97%";
        countUp(n0, 99, "%");
      }, 200);
      later(() => {
        if (b1) b1.style.width = "96%";
        countUp(n1, 96, "%");
      }, 550);
      later(() => {
        if (b2) b2.style.width = "60%";
        countUp(n2, 3.0, "", 1);
      }, 900);
      later(heroLoop, 5200);
    };

    const heroLoop = () => {
      clear();
      if (textRef.current) textRef.current.textContent = "";
      textRef.current?.classList.remove("done");
      qRef.current?.classList.remove("show");
      runRef.current?.classList.remove("show");
      outRef.current?.classList.remove("show");
      cardRef.current?.classList.remove("active");
      if (n0) n0.textContent = "0%";
      if (n1) n1.textContent = "0%";
      if (n2) n2.textContent = "0.0";
      if (b0) b0.style.width = "0";
      if (b1) b1.style.width = "0";
      if (b2) b2.style.width = "0";

      if (reduce) {
        finishAll();
        return;
      }

      cardRef.current?.classList.add("active");
      let i = 0;
      const typeStep = () => {
        if (i <= DEMO_TEXT.length) {
          if (textRef.current) textRef.current.textContent = DEMO_TEXT.slice(0, i);
          i++;
          later(typeStep, 42);
        } else {
          textRef.current?.classList.add("done");
          later(() => cardRef.current?.classList.remove("active"), 200);
          later(() => qRef.current?.classList.add("show"), 500);
          later(() => runRef.current?.classList.add("show"), 1600);
        }
      };
      typeStep();

      if (btnRef.current) {
        btnRef.current.onclick = () => goRun();
      }
      later(() => {
        if (!outRef.current?.classList.contains("show")) goRun();
      }, 2600);
    };

    heroLoop();
    return clear;
  }, []);

  return (
    <div className="flow" aria-label="Jev in action demo">
      <div className="flow-top">
        <span className="ft-label">
          <i /> JEV IN ACTION
        </span>
        <span className="ft-meta">~0.5 s · 5 free runs</span>
      </div>

      <div className="flow-card" ref={cardRef}>
        <div className="fc-label">Text</div>
        <p className="typing" ref={textRef} aria-hidden="true" />
      </div>

      <div className="flow-q" ref={qRef}>
        <div className="fq-item">
          <span className="fq-type">Choice</span>Which team should handle this
          ticket?
        </div>
        <div className="fq-item">
          <span className="fq-type yn">Yes / No</span>Does this need a response
          today?
        </div>
        <div className="fq-item">
          <span className="fq-type sc">Score</span>How frustrated is the
          customer?
        </div>
      </div>

      <div className="flow-run" ref={runRef}>
        <button className="run-btn" ref={btnRef} type="button">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Run Jev
        </button>
      </div>

      <div className="flow-out" ref={outRef}>
        <div className="foc">
          <div className="foc-top">
            <span className="fq-type">Choice</span>
            <strong>billing</strong>
            <span className="foc-num" id="n0">0%</span>
          </div>
          <div className="bar">
            <i id="b0" style={{ background: "var(--c0)" }} />
          </div>
        </div>
        <div className="foc">
          <div className="foc-top">
            <span className="fq-type yn">Yes / No</span>
            <strong>urgent</strong>
            <span className="foc-num" id="n1">0%</span>
          </div>
          <div className="bar">
            <i id="b1" style={{ background: "var(--c1)" }} />
          </div>
        </div>
        <div className="foc">
          <div className="foc-top">
            <span className="fq-type sc">Score</span>
            <strong>angry</strong>
            <span className="foc-num" id="n2">0.0</span>
          </div>
          <div className="bar">
            <i id="b2" style={{ background: "var(--c2)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
