import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsForm } from "./components/SettingsForm/SettingsForm";

const defaultPreset = { lapTime: 40, overallTime: 60, warmupTime: 5 };

function App() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [overallTime, setOverallTime] = useState(defaultPreset.overallTime);
  const [lapTime, setLapTime] = useState(defaultPreset.lapTime);
  const [seconds, setSeconds] = useState(0);
  const [warmupTime, setWarmupTime] = useState(defaultPreset.warmupTime);
  const [warmupRemaining, setWarmupRemaining] = useState<number | null>(null);

  const warmupRemainingRef = useRef<number | null>(null);

  warmupRemainingRef.current = warmupRemaining;

  const restSeconds = overallTime - lapTime;
  const isLapPeriod = seconds <= lapTime;

  const lapSeconds = Math.min(seconds, lapTime);
  const restSecondsPassed = Math.min(seconds - lapTime, restSeconds);

  const lapProgressWidthPercent = (lapSeconds / overallTime) * 100;
  const restProgressWidthPercent = (restSecondsPassed / overallTime) * 100;

  useEffect(() => {
    if (hasStarted && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setWarmupRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            warmupRemainingRef.current = null;
            return null;
          }
          warmupRemainingRef.current = prev - 1;
          return prev - 1;
        });
        setSeconds((prevSecond) => {
          if (warmupRemainingRef.current !== null) return prevSecond;
          const nextSecond = prevSecond + 1;
          return nextSecond === overallTime ? 0 : nextSecond;
        });
      }, 1000);
    }

    if (!hasStarted && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSeconds(0);
      setWarmupRemaining(null);
    }
  }, [hasStarted, overallTime]);

  const timerColorClass = !hasStarted || warmupRemaining !== null
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
