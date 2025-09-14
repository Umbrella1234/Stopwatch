import { useEffect, useState, useRef } from "react";
import cn from "classnames";
import "./App.css";

const Button: FunctionComponent<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => (
  <button
    {...props}
    className={`p-2 border-2 border-amber-100 cursor-pointer rounded-2xl hover:opacity-80 ${props.className}`}
  />
);

const Input: FunctionComponent<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
> = (props) => (
  <input
    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    {...props}
  />
);

const presets = [
  { lapTime: 40, overallTime: 60, label: "40 work 20 rest" },
  { lapTime: 60, overallTime: 60, label: "60 work" },
  { lapTime: 90, overallTime: 90, label: "90 work" },
];

const [absPreset] = presets;

const SettingsForm: FunctionComponent<{
  lapTimeInitial: number;
  overallTimeIntial: number;
  onSubmit: (formData: { lapTime: number; overallTime: number }) => void;
  onClose?: () => void;
}> = ({ lapTimeInitial, onSubmit, onClose, overallTimeInitial }) => {
  const [lapTime, setLapTime] = useState(lapTimeInitial);
  const [overallTime, setOverallTime] = useState(overallTimeInitial);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ lapTime, overallTime });
      }}
    >
      <div className="flex flex-col gap-4">
        <select
          value=""
          label="Presets"
          onChange={(e) => {
            const preset = presets.find((p) => p.label === e.target.value);
            if (preset) {
              onSubmit({
                lapTime: preset.lapTime,
                overallTime: preset.overallTime,
              });
            }
          }}
        >
          <option value="" disabled>
            -- Select a preset --
          </option>
          {presets.map((preset) => {
            return (
              <option key={preset.label} value={preset.label}>
                {preset.label}
              </option>
            );
          })}
        </select>
        <div>
          <label>Overall time:</label>
          <Input
            onChange={(e) => setOverallTime(Number(e.target.value))}
            value={overallTime}
            type="number"
            min={0}
          />
        </div>
        <div>
          <label>Lap time:</label>
          <Input
            onChange={(e) => setLapTime(Number(e.target.value))}
            value={lapTime}
            type="number"
            min={0}
            max={overallTime}
          />
        </div>
      </div>
      <div className="flex mt-6">
        <div className="ml-auto flex gap-4">
          <Button onClick={onClose} type="button">
            Close
          </Button>
          <Button type="submit">Apply</Button>
        </div>
      </div>
    </form>
  );
};

function App() {
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [overallTime, setOverallTime] = useState(absPreset.overallTime);
  const [lapTime, setLapTime] = useState(absPreset.lapTime);
  const [seconds, setSeconds] = useState(0);

  const restSecs = overallTime - lapTime;
  const restSecsPassed = Math.min(seconds - lapTime, restSecs);

  const isLapPeriod = seconds <= lapTime;
  const isRestPeriod = !isLapPeriod;

  const lapSeconds = Math.min(seconds, lapTime);
  const lapProgressWidthPercent = (lapSeconds / overallTime) * 100;
  const restProgressWidthPercent = (restSecsPassed / overallTime) * 100;

  useEffect(() => {
    if (hasStarted && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSecond) => {
          const nextSecond = prevSecond + 1;
          return nextSecond > overallTime ? 0 : nextSecond;
        });
      }, 1000);
    }

    if (!hasStarted && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSeconds(0);
    }
  }, [hasStarted, overallTime]);

  const secsClass = cn("text-9xl cursor-pointer mx-auto", {
    [`text-red-400`]: hasStarted && isLapPeriod,
    [`text-blue-400`]: hasStarted && isRestPeriod,
    "text-gray-600": !hasStarted,
  });

  const handleTimerClick = () => {
    setHasStarted(!hasStarted);
  };

  const onSubmit: SettingsForm["props"]["onSubmit"] = ({
    lapTime,
    overallTime,
  }) => {
    setShouldShowSettings(false);
    setLapTime(lapTime);
    setOverallTime(overallTime);

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
        <button onClick={handleTimerClick} className={secsClass}>
          {seconds}
        </button>
        <div className="relative mt-4 h-2 w-full bg-green-50 rounded-2xl">
          <div
            className={cn(
              `z-1 absolute top-0 left-0 h-full bg-red-400 rounded-l-2xl`,
              {
                "rounded-r-2xl": !isRestPeriod,
              }
            )}
            style={{ width: `${lapProgressWidthPercent}%` }}
          />
          {isRestPeriod && (
            <div
              className={`z-1 absolute top-0 h-full bg-blue-400 rounded-r-2xl`}
              style={{
                width: `${restProgressWidthPercent}%`,
                left: `${lapProgressWidthPercent}%`,
              }}
            />
          )}
        </div>
      </div>
      {shouldShowSettings && (
        <div className="z-3 w-[90%] max-w-[400px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-amber-100 rounded-lg bg-gray-800 p-4">
          <div className="text-center">Settings</div>
          <div className="mt-4">
            <SettingsForm
              onClose={() => setShouldShowSettings(false)}
              onSubmit={onSubmit}
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
