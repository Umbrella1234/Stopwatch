export type TimerSettings = {
  lapTime: number;
  overallTime: number;
  warmupTime: number;
};

export const defaultSettings: TimerSettings = {
  lapTime: 40,
  overallTime: 60,
  warmupTime: 5,
};

export type StopwatchPhase = "idle" | "warmup" | "lap" | "rest";

export type StopwatchView = {
  phase: StopwatchPhase;
  seconds: number;
  completedLaps: number;
  warmupRemaining: number;
};

type GetStopwatchViewParams = {
  elapsedMs: number | null;
  settings: TimerSettings;
};

export function getStopwatchView({
  elapsedMs,
  settings,
}: GetStopwatchViewParams): StopwatchView {
  if (elapsedMs === null) {
    return { phase: "idle", seconds: 0, completedLaps: 0, warmupRemaining: 0 };
  }

  const { lapTime, overallTime, warmupTime } = settings;
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));

  if (elapsedSec < warmupTime) {
    return {
      phase: "warmup",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: warmupTime - elapsedSec,
    };
  }

  const mainElapsedSec = elapsedSec - warmupTime;
  const seconds = mainElapsedSec % overallTime;
  const completedLaps =
    Math.floor(mainElapsedSec / overallTime) + (seconds > lapTime ? 1 : 0);

  return {
    phase: seconds <= lapTime ? "lap" : "rest",
    seconds,
    completedLaps,
    warmupRemaining: 0,
  };
}
