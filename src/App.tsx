import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsForm } from "./components/SettingsForm/SettingsForm";

const defaultPreset = { lapTime: 40, overallTime: 60 };

function App() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [overallTime, setOverallTime] = useState(defaultPreset.overallTime);
  const [lapTime, setLapTime] = useState(defaultPreset.lapTime);
  const [seconds, setSeconds] = useState(0);

  const restSeconds = overallTime - lapTime;
  const isLapPeriod = seconds <= lapTime;

  const lapSeconds = Math.min(seconds, lapTime);
  const restSecondsPassed = Math.min(seconds - lapTime, restSeconds);

  const lapProgressWidthPercent = (lapSeconds / overallTime) * 100;
  const restProgressWidthPercent = (restSecondsPassed / overallTime) * 100;

  useEffect(() => {
    if (hasStarted && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSecond) => {
          const nextSecond = prevSecond + 1;
          return nextSecond === overallTime ? 0 : nextSecond;
        });
      }, 1000);
    }

    if (!hasStarted && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSeconds(0);
    }
  }, [hasStarted, overallTime]);

  const timerColorClass = !hasStarted
    ? "text-muted-foreground"
    : isLapPeriod
      ? "text-primary"
      : "text-chart-1";

  const handleTimerClick = () => {
    setHasStarted(!hasStarted);
  };

  const handleCloseSettings = () => setShouldShowSettings(false);

  const handleSubmitSettings = ({
    lapTime: newLapTime,
    overallTime: newOverallTime,
  }: {
    lapTime: number;
    overallTime: number;
  }) => {
    setShouldShowSettings(false);
    setLapTime(newLapTime);
    setOverallTime(newOverallTime);

    if (hasStarted) {
      setHasStarted(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-background p-4 relative flex flex-col">
      <div className="flex">
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
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
