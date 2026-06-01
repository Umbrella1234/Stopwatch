import { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import { Button } from "./components/Button/Button";
import { SettingsForm } from "./components/SettingsForm/SettingsForm";

const defaultPreset = { lapTime: 40, overallTime: 60 };

function App() {
  const intervalRef = useRef<number | null>(null);

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

  const secondsClassName = classNames("text-9xl cursor-pointer mx-auto", {
    "text-red-400": hasStarted && isLapPeriod,
    "text-blue-400": hasStarted && !isLapPeriod,
    "text-gray-600": !hasStarted,
  });

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
    <div className="w-screen h-screen bg-gray-900 text-green-400 p-4 relative flex flex-col">
      <div className="flex">
        <Button className="ml-auto" onClick={() => setShouldShowSettings(true)}>
          Settings
        </Button>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <button onClick={handleTimerClick} className={secondsClassName}>
          {seconds}
        </button>
        <div className="relative mt-4 h-2 w-full bg-green-50 rounded-2xl">
          <div
            className={classNames(
              "absolute top-0 left-0 h-full bg-red-400 rounded-l-2xl",
              {
                "rounded-r-2xl": isLapPeriod,
              },
            )}
            style={{ width: `${lapProgressWidthPercent}%` }}
          />
          {!isLapPeriod && (
            <div
              className="absolute top-0 h-full bg-blue-400 rounded-r-2xl"
              style={{
                width: `${restProgressWidthPercent}%`,
                left: `${lapProgressWidthPercent}%`,
              }}
            />
          )}
        </div>
      </div>
      {shouldShowSettings && (
        <div className="w-[90%] max-w-[400px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-amber-100 rounded-lg bg-gray-800 p-4">
          <div className="text-center">Settings</div>
          <div className="mt-4">
            <SettingsForm
              onClose={handleCloseSettings}
              onSubmit={handleSubmitSettings}
              overallTimeInitial={overallTime}
              lapTimeInitial={lapTime}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
