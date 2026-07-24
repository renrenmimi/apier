"use client";

// 通用「逐帧播放器」—— 把一次请求/一段流程拆成慢动作的骨架。
// 每一帧是一张完整快照,组件负责播放控制(上一步/下一步/自动播放/进度),
// 帧数据由各章自己写。自由形态的动画请在章节内自建组件,
// 复用 useStepper + <StepControls /> 和 .viz/.viz-stage/.viz-msg/.viz-ctl 样式。

import { useEffect, useRef, useState, type ReactNode } from "react";

export function useStepper(total: number, intervalMs = 1400) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= total - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, total, intervalMs]);

  return {
    step,
    playing,
    prev: () => {
      setPlaying(false);
      setStep((s) => Math.max(0, s - 1));
    },
    next: () => {
      setPlaying(false);
      setStep((s) => Math.min(total - 1, s + 1));
    },
    toggle: () => {
      if (step >= total - 1) setStep(0);
      setPlaying((p) => !p);
    },
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
  };
}

export function StepControls({
  stepper,
  step,
  total,
}: {
  stepper: ReturnType<typeof useStepper>;
  step: number;
  total: number;
}) {
  return (
    <div className="viz-ctl">
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.prev}
        disabled={step === 0}
      >
        ← 上一步
      </button>
      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={stepper.toggle}
      >
        {stepper.playing ? "⏸ 暂停" : step >= total - 1 ? "↻ 重播" : "▶ 自动播放"}
      </button>
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.next}
        disabled={step >= total - 1}
      >
        下一步 →
      </button>
      <span
        className="mono dim"
        style={{ marginLeft: "auto", fontSize: 12 }}
        aria-live="polite"
      >
        {step + 1} / {total}
      </span>
    </div>
  );
}

/* ---------- FlowStepper:请求旅程逐帧图 ----------
 * 舞台上固定两端(客户端 / 服务器,可自定义),中间是每帧变化的「在途包裹」。
 * 各章也可以完全自绘舞台,只用 useStepper + StepControls。 */

export interface FlowFrame {
  /** 舞台内容 —— 每帧一张完整快照(通常是几个 .flow-node + 一个在途 .flow-packet) */
  stage: ReactNode;
  /** 本帧旁白 */
  msg: ReactNode;
}

export function FlowStepper({
  title,
  frames,
}: {
  title: ReactNode;
  frames: FlowFrame[];
}) {
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      <div className="viz-stage">
        <div className="viz-scroll">{f.stage}</div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
