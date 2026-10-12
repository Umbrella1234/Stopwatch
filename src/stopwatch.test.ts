import { describe, expect, it } from "vitest";
import { defaultSettings, getStopwatchView, type TimerSettings } from "./stopwatch";

const settings: TimerSettings = { lapTime: 40, overallTime: 60, warmupTime: 5 };

describe("getStopwatchView", () => {
  it("is idle before the timer starts", () => {
    expect(getStopwatchView({ elapsedMs: null, settings: defaultSettings })).toEqual({
      phase: "idle",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 0,
    });
  });

  it("reports the first warmup second", () => {
    expect(getStopwatchView({ elapsedMs: 0, settings })).toEqual({
      phase: "warmup",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 5,
    });
  });

  it("reports the last warmup second", () => {
    expect(getStopwatchView({ elapsedMs: 4000, settings })).toEqual({
      phase: "warmup",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 1,
    });
  });

  it("starts the lap exactly when warmup ends", () => {
    expect(getStopwatchView({ elapsedMs: 5000, settings })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 0,
    });
  });

  it("stays in the lap on its last second and does not count it yet", () => {
    expect(getStopwatchView({ elapsedMs: 45000, settings })).toEqual({
      phase: "lap",
      seconds: 40,
      completedLaps: 0,
      warmupRemaining: 0,
    });
  });

  it("enters rest one second after the lap and counts the lap", () => {
    expect(getStopwatchView({ elapsedMs: 46000, settings })).toEqual({
      phase: "rest",
      seconds: 41,
      completedLaps: 1,
      warmupRemaining: 0,
    });
  });

  it("accounts for laps across two cycles and keeps the count until the next rest", () => {
    expect(getStopwatchView({ elapsedMs: 5000 + 59000, settings })).toEqual({
      phase: "rest",
      seconds: 59,
      completedLaps: 1,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 5000 + 60000, settings })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 1,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 5000 + 100000, settings })).toEqual({
      phase: "lap",
      seconds: 40,
      completedLaps: 1,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 5000 + 101000, settings })).toEqual({
      phase: "rest",
      seconds: 41,
      completedLaps: 2,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 5000 + 120000, settings })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 2,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 5000 + 161000, settings })).toEqual({
      phase: "rest",
      seconds: 41,
      completedLaps: 3,
      warmupRemaining: 0,
    });
  });

  it("counts a lap when the display wraps with equal lap and overall times", () => {
    const equalTimes: TimerSettings = { lapTime: 45, overallTime: 45, warmupTime: 0 };

    expect(getStopwatchView({ elapsedMs: 44000, settings: equalTimes })).toEqual({
      phase: "lap",
      seconds: 44,
      completedLaps: 0,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 45000, settings: equalTimes })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 1,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 90000, settings: equalTimes })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 2,
      warmupRemaining: 0,
    });
  });

  it("treats a zero lap time as resting from the first main second", () => {
    const zeroLap: TimerSettings = { lapTime: 0, overallTime: 60, warmupTime: 0 };

    expect(getStopwatchView({ elapsedMs: 0, settings: zeroLap })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 1000, settings: zeroLap })).toEqual({
      phase: "rest",
      seconds: 1,
      completedLaps: 1,
      warmupRemaining: 0,
    });

    expect(getStopwatchView({ elapsedMs: 61000, settings: zeroLap })).toEqual({
      phase: "rest",
      seconds: 1,
      completedLaps: 2,
      warmupRemaining: 0,
    });
  });

  it("floors sub-second elapsed time to whole seconds", () => {
    const noWarmup: TimerSettings = { lapTime: 40, overallTime: 60, warmupTime: 0 };

    expect(getStopwatchView({ elapsedMs: 999, settings: noWarmup })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 0,
    });
  });

  it("clamps negative elapsed time (clock skew) to zero", () => {
    const noWarmup: TimerSettings = { lapTime: 40, overallTime: 60, warmupTime: 0 };

    expect(getStopwatchView({ elapsedMs: -500, settings: noWarmup })).toEqual({
      phase: "lap",
      seconds: 0,
      completedLaps: 0,
      warmupRemaining: 0,
    });
  });
});
