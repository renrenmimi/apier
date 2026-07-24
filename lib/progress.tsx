"use client";

// 全站学习进度 —— localStorage 持久化。
// 两类事实:① 勾掉的动手任务("first-call/poke-height" 这种 `${章节}/${labId}` 键);
// ② 每章 Quiz 的最好成绩。章节状态由此推导:new(没动过)/ doing(动过)/ done(测验全对)。
// 所有组件(侧栏、LabSet、Quiz、终章总表)共用这一个 context,别自己另存一份。

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ChapterId } from "@/lib/curriculum";

const KEY = "apier-progress-v1";

export interface ProgressData {
  labs: Record<string, 1>;
  quiz: Partial<Record<ChapterId, { right: number; total: number }>>;
}

const EMPTY: ProgressData = { labs: {}, quiz: {} };

interface Ctx {
  ready: boolean;
  data: ProgressData;
  isDone: (pid: string) => boolean;
  toggleLab: (pid: string) => void;
  reportQuiz: (ch: ChapterId, right: number, total: number) => void;
  chapterState: (ch: ChapterId) => "new" | "doing" | "done";
  labCount: (ch: ChapterId) => number;
  totalLabs: number;
  reset: () => void;
}

const ProgressContext = createContext<Ctx>({
  ready: false,
  data: EMPTY,
  isDone: () => false,
  toggleLab: () => {},
  reportQuiz: () => {},
  chapterState: () => "new",
  labCount: () => 0,
  totalLabs: 0,
  reset: () => {},
});

function load(): ProgressData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      labs: parsed.labs ?? {},
      quiz: parsed.quiz ?? {},
    };
  } catch {
    return EMPTY;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressData) => {
    setData(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 私密模式等写入失败:仅内存态 */
    }
  }, []);

  const isDone = useCallback((pid: string) => !!data.labs[pid], [data]);

  const toggleLab = useCallback(
    (pid: string) => {
      const labs = { ...data.labs };
      if (labs[pid]) delete labs[pid];
      else labs[pid] = 1;
      persist({ ...data, labs });
    },
    [data, persist],
  );

  const reportQuiz = useCallback(
    (ch: ChapterId, right: number, total: number) => {
      const prev = data.quiz[ch];
      // 只保留最好成绩
      if (prev && prev.right / prev.total >= right / total) return;
      persist({ ...data, quiz: { ...data.quiz, [ch]: { right, total } } });
    },
    [data, persist],
  );

  const chapterState = useCallback(
    (ch: ChapterId): "new" | "doing" | "done" => {
      const q = data.quiz[ch];
      if (q && q.total > 0 && q.right === q.total) return "done";
      if (q) return "doing";
      if (Object.keys(data.labs).some((k) => k.startsWith(ch + "/")))
        return "doing";
      return "new";
    },
    [data],
  );

  const labCount = useCallback(
    (ch: ChapterId) =>
      Object.keys(data.labs).filter((k) => k.startsWith(ch + "/")).length,
    [data],
  );

  const reset = useCallback(() => persist(EMPTY), [persist]);

  return (
    <ProgressContext.Provider
      value={{
        ready,
        data,
        isDone,
        toggleLab,
        reportQuiz,
        chapterState,
        labCount,
        totalLabs: Object.keys(data.labs).length,
        reset,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
