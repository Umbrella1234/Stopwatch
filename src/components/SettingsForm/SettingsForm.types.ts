export interface SettingsFormProps {
  lapTimeInitial: number;
  overallTimeInitial: number;
  warmupTimeInitial: number;
  onSubmit: (formData: {
    lapTime: number;
    overallTime: number;
    warmupTime: number;
  }) => void;
  onClose: () => void;
}
