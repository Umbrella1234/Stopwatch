import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsForm } from "./components/SettingsForm/SettingsForm";

const defaultPreset = { lapTime: 40, overallTime: 60, warmupTime: 5 };

type StopwatchView = {
  seconds: number;
  completedLaps: number;
  warmupRemaining: number | null;
};

type StopwatchViewParams = {
  elapsedMs: number | null;
  lapTime: number;
  overallTime: number;
  warmupTime: number;
};

function getStopwatchView({
  elapsedMs,
  lapTime,
  overallTime,
  warmupTime,
}: StopwatchViewParams): StopwatchView {
  if (elapsedMs === null) {
    return { seconds: 0, completedLaps: 0, warmupRemaining: null };
  }

  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const warmupRemaining = warmupTime - elapsedSec;

  if (warmupRemaining > 0) {
    return { seconds: 0, completedLaps: 0, warmupRemaining };
  }

  const mainElapsedSec = Math.max(0, elapsedSec - warmupTime);
  const seconds = mainElapsedSec % overallTime;
  const completedLaps =
    Math.floor(mainElapsedSec / overallTime) +
    (lapTime < overallTime && mainElapsedSec % overallTime >= lapTime + 1 ? 1 : 0);

  return { seconds, completedLaps, warmupRemaining: null };
}

function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [overallTime, setOverallTime] = useState(defaultPreset.overallTime);
  const [lapTime, setLapTime] = useState(defaultPreset.lapTime);
  const [warmupTime, setWarmupTime] = useState(defaultPreset.warmupTime);

  const elapsedMs = startedAt === null ? null : now - startedAt;
  const { seconds, completedLaps, warmupRemaining } = getStopwatchView({
    elapsedMs,
    lapTime,
    overallTime,
    warmupTime,
  });

  const restSeconds = overallTime - lapTime;
  const isLapPeriod = seconds <= lapTime;

  const lapSeconds = Math.min(seconds, lapTime);
  const restSecondsPassed = Math.min(seconds - lapTime, restSeconds);

  const lapProgressWidthPercent = (lapSeconds / overallTime) * 100;
  const restProgressWidthPercent = (restSecondsPassed / overallTime) * 100;

  useEffect(() => {
    if (startedAt !== null) {
      const syncNow = () => setNow(Date.now());

      syncNow();

      const intervalId = setInterval(syncNow, 250);

      document.addEventListener("visibilitychange", syncNow);
      window.addEventListener("focus", syncNow);
      window.addEventListener("pageshow", syncNow);

      return () => {
        clearInterval(intervalId);
        document.removeEventListener("visibilitychange", syncNow);
        window.removeEventListener("focus", syncNow);
        window.removeEventListener("pageshow", syncNow);
      };
    }
  }, [startedAt]);

  const timerColorClass =
    startedAt === null || warmupRemaining !== null
      ? "text-muted-foreground"
      : isLapPeriod
        ? "text-primary"
        : "text-chart-1";

  const handleTimerClick = () => {
    if (startedAt !== null) {
      setStartedAt(null);
    } else {
      const timestamp = Date.now();
      setStartedAt(timestamp);
      setNow(timestamp);
    }
  };

  const handleCloseSettings = () => setShouldShowSettings(false);

  const handleSubmitSettings = ({
    lapTime: newLapTime,
    overallTime: newOverallTime,
    warmupTime: newWarmupTime,
  }: {
    lapTime: number;
    overallTime: number;
    warmupTime: number;
  }) => {
    setShouldShowSettings(false);
    setLapTime(newLapTime);
    setOverallTime(newOverallTime);
    setWarmupTime(newWarmupTime);

    if (startedAt !== null) {
      setStartedAt(null);
    }
  };

  return (
    <div className="w-screen h-screen bg-background p-4 relative flex flex-col">
      <div className="flex items-center">
        {warmupRemaining !== null && (
          <div className="absolute left-1/2 -translate-x-1/2 text-6xl text-chart-1">
            {warmupRemaining}
          </div>
        )}
        <div className="text-sm font-mono tabular-nums">
          Laps:{completedLaps}
        </div>
        <Button
          className="ml-auto"
          variant="outline"
          onClick={() => setShouldShowSettings(true)}
        >
          Settings
        </Button>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <button
          onClick={handleTimerClick}
          className={`text-9xl cursor-pointer mx-auto ${timerColorClass}`}
        >
          {seconds}
        </button>
        <div className="relative mt-4 h-2 w-full bg-muted rounded-full">
          <div
            className={`absolute top-0 left-0 h-full bg-destructive rounded-l-full ${
              isLapPeriod ? "rounded-r-full" : ""
            }`}
            style={{ width: `${lapProgressWidthPercent}%` }}
          />
          {!isLapPeriod && (
            <div
              className="absolute top-0 h-full bg-chart-1 rounded-r-full"
              style={{
                width: `${restProgressWidthPercent}%`,
                left: `${lapProgressWidthPercent}%`,
              }}
            />
          )}
        </div>
      </div>
      <Dialog
        open={shouldShowSettings}
        onOpenChange={(open) => setShouldShowSettings(open)}
      >
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <SettingsForm
            onClose={handleCloseSettings}
            onSubmit={handleSubmitSettings}
            overallTimeInitial={overallTime}
            lapTimeInitial={lapTime}
            warmupTimeInitial={warmupTime}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
