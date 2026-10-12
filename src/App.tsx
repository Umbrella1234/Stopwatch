import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SettingsForm } from "./components/SettingsForm/SettingsForm";
import {
  defaultSettings,
  getStopwatchView,
  type StopwatchPhase,
  type TimerSettings,
} from "./stopwatch";

const timerColorClassByPhase = {
  idle: "text-muted-foreground",
  warmup: "text-muted-foreground",
  lap: "text-primary",
  rest: "text-chart-1",
} satisfies Record<StopwatchPhase, string>;

function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  const elapsedMs = startedAt === null ? null : now - startedAt;
  const view = getStopwatchView({ elapsedMs, settings });
  const { phase, seconds, completedLaps, warmupRemaining } = view;

  const restSeconds = settings.overallTime - settings.lapTime;
  const isLapPeriod = phase !== "rest";

  const lapSeconds = Math.min(seconds, settings.lapTime);
  const restSecondsPassed = Math.min(seconds - settings.lapTime, restSeconds);

  const lapProgressWidthPercent = (lapSeconds / settings.overallTime) * 100;
  const restProgressWidthPercent = (restSecondsPassed / settings.overallTime) * 100;

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

  const timerColorClass = timerColorClassByPhase[phase];

  const handleTimerClick = () => {
    if (startedAt === null) {
      const timestamp = Date.now();
      setStartedAt(timestamp);
      setNow(timestamp);
    } else {
      setStartedAt(null);
    }
  };

  const handleCloseSettings = () => setShouldShowSettings(false);

  const handleSubmitSettings = (next: TimerSettings) => {
    setShouldShowSettings(false);
    setSettings(next);
    setStartedAt(null);
  };

  return (
    <div className="w-screen h-screen bg-background p-4 relative flex flex-col">
      <div className="flex items-center">
        {phase === "warmup" && (
          <div
            data-testid="warmup-countdown"
            className="absolute left-1/2 -translate-x-1/2 text-6xl text-chart-1"
          >
            {warmupRemaining}
          </div>
        )}
        <div data-testid="laps" className="text-sm font-mono tabular-nums">
          Laps:{completedLaps}
        </div>
        <Button
          data-testid="open-settings"
          className="ml-auto"
          variant="outline"
          onClick={() => setShouldShowSettings(true)}
        >
          Settings
        </Button>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <button
          data-testid="timer"
          onClick={handleTimerClick}
          className={cn("text-9xl cursor-pointer mx-auto", timerColorClass)}
        >
          {seconds}
        </button>
        <div className="relative mt-4 h-2 w-full bg-muted rounded-full">
          <div
            className={cn(
              "absolute top-0 left-0 h-full bg-destructive rounded-l-full",
              isLapPeriod && "rounded-r-full",
            )}
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
      <Dialog open={shouldShowSettings} onOpenChange={setShouldShowSettings}>
        <DialogContent data-testid="settings-dialog" className="p-6">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <SettingsForm
            initialSettings={settings}
            onClose={handleCloseSettings}
            onSubmit={handleSubmitSettings}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
