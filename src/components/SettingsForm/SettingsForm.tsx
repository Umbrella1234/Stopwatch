import { type FC, useState } from "react";
import { type SettingsFormProps } from "./SettingsForm.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const presets = [
  { lapTime: 40, overallTime: 60, label: "40 work 20 rest" },
  { lapTime: 45, overallTime: 60, label: "40 work 15 rest" },
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

  return (
    <form
      id="settings-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ lapTime, overallTime });
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label>Preset</Label>
          <Select
            onValueChange={(value) => {
              const preset = presets.find((p) => p.label === value);
              if (preset) {
                setLapTime(preset.lapTime);
                setOverallTime(preset.overallTime);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select a preset --" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.label} value={preset.label}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="overall-time">Overall time</Label>
          <Input
            id="overall-time"
            onChange={(e) => setOverallTime(Number(e.target.value))}
            value={overallTime}
            type="number"
            min={0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lap-time">Lap time</Label>
          <Input
            id="lap-time"
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
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
          <Button type="submit">Apply</Button>
        </div>
      </div>
    </form>
  );
};
