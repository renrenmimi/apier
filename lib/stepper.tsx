"use client";

// 通用「逐帧播放器」—— 把一次请求/一段流程拆成慢动作的骨架。
// 每一帧是一张完整快照,组件负责播放控制(上一步/下一步/自动播放/进度),
// 帧数据由各章自己写。自由形态的动画请在章节内自建组件,
// 复用 useStepper + <StepControls /> 和 .viz/.viz-stage/.viz-msg/.viz-ctl 样式。

import { useEffect, useState, type ReactNode } from "react";
import { useL, type Loc } from "@/lib/i18n";
import { stageRegion } from "@/lib/scroll-region";

export function useStepper(total: number, intervalMs = 1400) {
  const [step, setStep] = useState(0);
  const [wantsToPlay, setWantsToPlay] = useState(false);

  // 「播到最后一帧就停」是从 step 推出来的,不是另一个要维护的状态。
  // 早先的写法在 effect 里补一次 setPlaying(false),那会多跑一轮渲染。
  const playing = wantsToPlay && step < total - 1;

  // 自动播放:每帧重新起一个 timeout,而不是一个长跑的 interval。
  // setStep 的更新函数保持纯粹(不在里面调 setPlaying —— 那在 StrictMode
  // 下会被双调用)。
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(
      () => setStep((s) => Math.min(s + 1, total - 1)),
      intervalMs,
    );
    return () => clearTimeout(id);
  }, [playing, step, total, intervalMs]);

  return {
    step,
    playing,
    prev: () => {
      setWantsToPlay(false);
      setStep((s) => Math.max(0, s - 1));
    },
    next: () => {
      setWantsToPlay(false);
      setStep((s) => Math.min(total - 1, s + 1));
    },
    toggle: () => {
      // 停在最后一帧时再点一次 = 从头重播。
      if (step >= total - 1) {
        setStep(0);
        setWantsToPlay(true);
        return;
      }
      setWantsToPlay((p) => !p);
    },
    reset: () => {
      setWantsToPlay(false);
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
  const L = useL();
  return (
    <div className="viz-ctl">
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.prev}
        disabled={step === 0}
      >
        {L({ en: "← Back", zh: "← 上一步" })}
      </button>
      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={stepper.toggle}
      >
        {stepper.playing
          ? L({ en: "⏸ Pause", zh: "⏸ 暂停" })
          : step >= total - 1
            ? L({ en: "↻ Replay", zh: "↻ 重播" })
            : L({ en: "▶ Play", zh: "▶ 自动播放" })}
      </button>
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.next}
        disabled={step >= total - 1}
      >
        {L({ en: "Next →", zh: "下一步 →" })}
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
  stage: Loc<ReactNode>;
  /** 本帧旁白 */
  msg: Loc<ReactNode>;
}

export function FlowStepper({
  title,
  frames,
}: {
  title: Loc<ReactNode>;
  frames: FlowFrame[];
}) {
  const L = useL();
  const stepper = useStepper(frames.length);
  // frames 变短(或为空)时 step 可能越界 —— 兜底,别让整页白屏。
  const f = frames[Math.min(stepper.step, frames.length - 1)];
  if (!f) return null;

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage">
        <div className="viz-scroll" ref={stageRegion}>
          {L(f.stage)}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {L(f.msg)}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
