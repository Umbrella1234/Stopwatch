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

const SettingsForm: FunctionComponent<{
  lapTimeInitial: number;
  onSubmit: (formData: { lapTime: number }) => void;
}> = ({ lapTimeInitial, onSubmit }) => {
  const [lapTime, setLapTime] = useState(lapTimeInitial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ lapTime });
      }}
    >
      <div>
        <label>Lap time:</label>
        <Input
          onChange={(e) => setLapTime(Number(e.target.value))}
          value={lapTime}
          type="number"
          min={0}
          max={60}
        />
      </div>
      <div className="flex mt-6">
        <Button type="submit" className="ml-auto">
          Apply
        </Button>
      </div>
    </form>
  );
};

function App() {
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [lapTime, setLapTime] = useState(3);
  const [seconds, setSeconds] = useState(0);

  const restSecs = 60 - lapTime;
  const restSecsPassed = Math.min(seconds - lapTime, restSecs);

  const isLapPeriod = seconds <= lapTime;
  const isRestPeriod = !isLapPeriod;

  const lapSeconds = Math.min(seconds, lapTime);
  const lapProgressWidthPercent = (lapSeconds / 60) * 100;
  const restProgressWidthPercent = (restSecsPassed / 60) * 100;

  useEffect(() => {
    if (hasStarted && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSecond) => {
          const nextSecond = prevSecond + 1;
          return nextSecond > 60 ? 0 : nextSecond;
        });
      }, 1000);
    }

    if (!hasStarted && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSeconds(0);
    }
  }, [hasStarted]);

  const secsClass = cn("text-9xl cursor-pointer mx-auto", {
    [`text-red-400`]: hasStarted && isLapPeriod,
    [`text-blue-400`]: hasStarted && isRestPeriod,
    "text-gray-600": !hasStarted,
  });

  const handleTimerClick = () => {
    setHasStarted(!hasStarted);
  };

  const onSubmit: SettingsForm["props"]["onSubmit"] = ({ lapTime }) => {
    setShouldShowSettings(false);
    setLapTime(lapTime);
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
        <div className="w-1/2 max-w-[400px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-amber-100 rounded-lg bg-gray-800 p-4">
          <div className="text-center">Settings</div>
          <SettingsForm onSubmit={onSubmit} lapTimeInitial={lapTime} />
        </div>
      )}
    </div>
  );
}

export default App;
