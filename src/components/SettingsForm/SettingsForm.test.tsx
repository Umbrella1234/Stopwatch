import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsForm } from "./SettingsForm";

const renderSettingsForm = () => {
  const onSubmit = vi.fn();
  const onClose = vi.fn();

  render(
    <SettingsForm
      initialSettings={{ lapTime: 40, overallTime: 60, warmupTime: 5 }}
      onSubmit={onSubmit}
      onClose={onClose}
    />,
  );

  return { onSubmit, onClose };
};

describe("SettingsForm", () => {
  it("renders the initial lap, overall, and warmup times", () => {
    renderSettingsForm();

    expect(screen.getByLabelText("Overall time")).toHaveValue(60);
    expect(screen.getByLabelText("Lap time")).toHaveValue(40);
    expect(screen.getByLabelText("Warmup time")).toHaveValue(5);
  });

  it("updates the typed field and leaves the other fields untouched", async () => {
    const user = userEvent.setup();
    renderSettingsForm();

    const lapInput = screen.getByLabelText("Lap time");
    await user.clear(lapInput);
    await user.type(lapInput, "10");

    expect(lapInput).toHaveValue(10);
    expect(screen.getByLabelText("Overall time")).toHaveValue(60);
    expect(screen.getByLabelText("Warmup time")).toHaveValue(5);
  });

  it("sets lap and overall times from the selected preset and leaves warmup untouched", async () => {
    const user = userEvent.setup();
    renderSettingsForm();

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "2 min" }));

    expect(screen.getByLabelText("Overall time")).toHaveValue(120);
    expect(screen.getByLabelText("Lap time")).toHaveValue(120);
    expect(screen.getByLabelText("Warmup time")).toHaveValue(5);
  });

  it("submits the edited draft on Apply", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderSettingsForm();

    const overallInput = screen.getByLabelText("Overall time");
    await user.clear(overallInput);
    await user.type(overallInput, "20");
    const lapInput = screen.getByLabelText("Lap time");
    await user.clear(lapInput);
    await user.type(lapInput, "10");
    const warmupInput = screen.getByLabelText("Warmup time");
    await user.clear(warmupInput);
    await user.type(warmupInput, "3");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      lapTime: 10,
      overallTime: 20,
      warmupTime: 3,
    });
  });

  it("closes without submitting on Close", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderSettingsForm();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not apply an overall time below 1", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderSettingsForm();

    const overallInput = screen.getByLabelText("Overall time");
    await user.clear(overallInput);
    await user.type(overallInput, "0");
    const lapInput = screen.getByLabelText("Lap time");
    await user.clear(lapInput);
    await user.type(lapInput, "0");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
