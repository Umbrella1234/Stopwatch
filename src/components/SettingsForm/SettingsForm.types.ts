import type { TimerSettings } from "../../stopwatch";

export interface SettingsFormProps {
  initialSettings: TimerSettings;
  onSubmit: (settings: TimerSettings) => void;
  onClose: () => void;
}
