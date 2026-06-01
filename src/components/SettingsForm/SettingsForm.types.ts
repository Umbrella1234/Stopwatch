export interface SettingsFormProps {
  lapTimeInitial: number;
  overallTimeInitial: number;
  onSubmit: (formData: { lapTime: number; overallTime: number }) => void;
  onClose: () => void;
}
