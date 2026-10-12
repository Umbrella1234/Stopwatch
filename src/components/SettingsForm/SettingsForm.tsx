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
  { value: "45", lapTime: 45, overallTime: 45, label: "45 secs" },
  { value: "60", lapTime: 60, overallTime: 60, label: "1 min" },
  { value: "90", lapTime: 90, overallTime: 90, label: "1 min 30 secs" },
  { value: "120", lapTime: 120, overallTime: 120, label: "2 min" },
  { value: "150", lapTime: 150, overallTime: 150, label: "2 min 30 secs" },
  { value: "180", lapTime: 180, overallTime: 180, label: "3 min" },
];

const presetsByValue = new Map(presets.map((preset) => [preset.value, preset]));

export const SettingsForm: FC<SettingsFormProps> = ({
  initialSettings,
  onSubmit,
  onClose,
}) => {
  const [draft, setDraft] = useState(initialSettings);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label>Preset</Label>
          <Select<string>
            onValueChange={(value) => {
              const preset = value === null ? undefined : presetsByValue.get(value);
              if (preset) {
                setDraft({
                  ...draft,
                  lapTime: preset.lapTime,
                  overallTime: preset.overallTime,
                });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select a preset --" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="overall-time">Overall time</Label>
          <Input
            data-testid="overall-time"
            id="overall-time"
            onChange={(e) =>
              setDraft({ ...draft, overallTime: Number(e.target.value) })
            }
            value={draft.overallTime}
            type="number"
            min={1}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lap-time">Lap time</Label>
          <Input
            data-testid="lap-time"
            id="lap-time"
            onChange={(e) => setDraft({ ...draft, lapTime: Number(e.target.value) })}
            value={draft.lapTime}
            type="number"
            min={0}
            max={draft.overallTime}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="warmup-time">Warmup time</Label>
          <Input
            data-testid="warmup-time"
            id="warmup-time"
            onChange={(e) =>
              setDraft({ ...draft, warmupTime: Number(e.target.value) })
            }
            value={draft.warmupTime}
            type="number"
            min={0}
          />
        </div>
      </div>
      <div className="flex mt-6">
        <div className="ml-auto flex gap-4">
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
          <Button data-testid="apply-settings" type="submit">
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
};
