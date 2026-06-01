import { type FC, useEffect, useState } from "react";
import { type SettingsFormProps } from "./SettingsForm.types";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";

const presets = [
  { lapTime: 40, overallTime: 60, label: "40 work 20 rest" },
  { lapTime: 60, overallTime: 60, label: "60 work" },
  { lapTime: 90, overallTime: 90, label: "90 work" },
] as const;

export const SettingsForm: FC<SettingsFormProps> = ({
  lapTimeInitial,
  overallTimeInitial,
  onSubmit,
  onClose,
}) => {
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
  }, [onClose]);

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
          {presets.map((preset) => (
            <option key={preset.label} value={preset.label}>
              {preset.label}
            </option>
          ))}
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
