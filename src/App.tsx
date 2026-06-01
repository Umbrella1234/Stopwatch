import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsForm } from "./components/SettingsForm/SettingsForm";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const defaultPreset = { lapTime: 40, overallTime: 60, warmupTime: 5 };

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [overallTime, setOverallTime] = useState(defaultPreset.overallTime);
  const [lapTime, setLapTime] = useState(defaultPreset.lapTime);
  const [seconds, setSeconds] = useState(0);
  const [warmupTime, setWarmupTime] = useState(defaultPreset.warmupTime);
  const [warmupRemaining, setWarmupRemaining] = useState<number | null>(null);
  const [completedLaps, setCompletedLaps] = useState(0);

  const restSeconds = overallTime - lapTime;
  const isLapPeriod = seconds <= lapTime;

  const lapSeconds = Math.min(seconds, lapTime);
  const restSecondsPassed = Math.min(seconds - lapTime, restSeconds);

  const lapProgressWidthPercent = (lapSeconds / overallTime) * 100;
  const restProgressWidthPercent = (restSecondsPassed / overallTime) * 100;

  useEffect(() => {
    if (!hasStarted) {
      setSeconds(0);
      setWarmupRemaining(null);
      setCompletedLaps(0);
      return;
    }

    let active = true;
    let warmupLeft = warmupTime;
    let tick = 0;

    (async () => {
      if (warmupLeft > 0) {
        do {
          await delay(1000);
          if (!active) return;
          warmupLeft--;
          setWarmupRemaining(warmupLeft || null);
        } while (active && warmupLeft > 0);
      }

      while (active) {
        await delay(1000);
        if (!active) return;

        const prevTick = tick;
        tick = tick + 1 === overallTime ? 0 : tick + 1;
        setSeconds(tick);

        if (prevTick === lapTime) {
          setCompletedLaps((prev) => prev + 1);
        } else if (lapTime === overallTime && tick === 0) {
          setCompletedLaps((prev) => prev + 1);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [hasStarted, overallTime, lapTime, warmupTime]);

  const timerColorClass =
    !hasStarted || warmupRemaining !== null
      ? "text-muted-foreground"
      : isLapPeriod
        ? "text-primary"
        : "text-chart-1";

  const handleTimerClick = () => {
    if (warmupRemaining !== null || hasStarted) {
      setHasStarted(false);
    } else {
      if (warmupTime > 0) {
        setWarmupRemaining(warmupTime);
      }
      setHasStarted(true);
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

    if (hasStarted) {
      setHasStarted(false);
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
