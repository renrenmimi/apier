"use client";

// 全站学习进度 —— localStorage 持久化。
// 两类事实:① 勾掉的动手任务("first-call/poke-height" 这种 `${章节}/${labId}` 键);
// ② 每章 Quiz 的最好成绩。章节状态由此推导:new(没动过)/ doing(动过)/ done(测验全对)。
// 所有组件(侧栏、LabSet、Quiz、终章总表)共用这一个 context,别自己另存一份。

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
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

// localStorage 是唯一数据源。useSyncExternalStore 允许服务端快照与客户端
// 快照不同,所以不必先渲染一次空数据、再在 effect 里补一次 setState。
// 它要求快照的引用稳定,所以这里把读到的对象缓存住,只有数据变了才换新的。
//
// 同一个浏览器可能同时开着好几个标签页。别的标签页写入时,这里会收到 storage 事件,
// 于是丢掉缓存、重新读;自己写入时也先读最新值、只合并这一次的改动,
// 不拿本标签页的旧快照整份覆盖 —— 否则两个标签页会互相抹掉对方勾选的任务。
const progressListeners = new Set<() => void>();
let cached: ProgressData | null = null;

function onStorage(e: StorageEvent) {
  // key 为 null 表示整个 localStorage 被清空
  if (e.key !== KEY && e.key !== null) return;
  cached = null;
  progressListeners.forEach((notify) => notify());
}

function subscribeProgress(onChange: () => void) {
  progressListeners.add(onChange);
  if (progressListeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    progressListeners.delete(onChange);
    if (progressListeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function readProgress(): ProgressData {
  if (cached === null) cached = load();
  return cached;
}

function progressOnServer(): ProgressData {
  return EMPTY;
}

/** 读最新的存储值,应用一次改动,再写回。返回 null 表示不需要改。 */
function updateProgress(change: (latest: ProgressData) => ProgressData | null) {
  let latest: ProgressData;
  try {
    // 写入失败过(私密模式等)时存储里没有数据,只能以内存态为准
    latest = window.localStorage.getItem(KEY) === null && cached ? cached : load();
  } catch {
    latest = cached ?? EMPTY;
  }
  const next = change(latest);
  if (next === null) return;
  cached = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 私密模式等写入失败:仅内存态 */
  }
  progressListeners.forEach((notify) => notify());
}

// 服务端没有本地数据,客户端第一帧就有 —— 这正是 ready 想表达的意思。
const readyOnClient = () => true;
const readyOnServer = () => false;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(
    subscribeProgress,
    readProgress,
    progressOnServer,
  );
  const ready = useSyncExternalStore(
    subscribeProgress,
    readyOnClient,
    readyOnServer,
  );

  const isDone = useCallback((pid: string) => !!data.labs[pid], [data]);

  const toggleLab = useCallback((pid: string) => {
    updateProgress((latest) => {
      const labs = { ...latest.labs };
      if (labs[pid]) delete labs[pid];
      else labs[pid] = 1;
      return { ...latest, labs };
    });
  }, []);

  const reportQuiz = useCallback((ch: ChapterId, right: number, total: number) => {
    updateProgress((latest) => {
      const prev = latest.quiz[ch];
      // 只保留最好成绩
      if (prev && prev.right / prev.total >= right / total) return null;
      return { ...latest, quiz: { ...latest.quiz, [ch]: { right, total } } };
    });
  }, []);

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

  const reset = useCallback(() => updateProgress(() => EMPTY), []);

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
