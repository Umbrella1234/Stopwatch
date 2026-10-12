import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const getTimerButton = () => screen.getByRole("button", { name: /^\d+$/ });

const queryProgressSegment = (className: string) =>
  document.querySelector<HTMLElement>(`.${className}`);

const getProgressSegment = (className: string) => {
  const segment = queryProgressSegment(className);

  if (segment === null) {
    throw new Error(`Missing progress segment: ${className}`);
  }

  return segment;
};

const parsePercent = (value: string) => Number.parseFloat(value);

const openSettings = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Settings" }));
};

const editSettings = async (
  user: ReturnType<typeof userEvent.setup>,
  values: { overallTime: number; lapTime: number; warmupTime: number },
) => {
  const overallInput = screen.getByLabelText("Overall time");
  await user.clear(overallInput);
  await user.type(overallInput, String(values.overallTime));
  const lapInput = screen.getByLabelText("Lap time");
  await user.clear(lapInput);
  await user.type(lapInput, String(values.lapTime));
  const warmupInput = screen.getByLabelText("Warmup time");
  await user.clear(warmupInput);
  await user.type(warmupInput, String(values.warmupTime));
};

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupUser = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it("shows an idle stopwatch with no settings dialog", () => {
    render(<App />);

    expect(getTimerButton()).toHaveTextContent("0");
    expect(getTimerButton()).toHaveClass("text-muted-foreground");
    expect(screen.getByText("Laps:0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Overall time")).not.toBeInTheDocument();
  });

  it("counts the warmup down while the main display stays at 0", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(getTimerButton()).toHaveTextContent("0");

    advance(1000);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(getTimerButton()).toHaveTextContent("0");

    advance(4000);

    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(getTimerButton()).toHaveTextContent("0");
    expect(getTimerButton()).toHaveClass("text-primary");
  });

  it("advances the display once per second during a lap", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(5000);

    expect(getTimerButton()).toHaveTextContent("0");

    advance(1000);
    expect(getTimerButton()).toHaveTextContent("1");

    advance(39000);
    expect(getTimerButton()).toHaveTextContent("40");
    expect(getTimerButton()).toHaveClass("text-primary");
    expect(screen.getByText("Laps:0")).toBeInTheDocument();
  });

  it("switches to the rest color and counts the lap when rest begins", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(45000);

    expect(getTimerButton()).toHaveTextContent("40");
    expect(getTimerButton()).toHaveClass("text-primary");
    expect(screen.getByText("Laps:0")).toBeInTheDocument();

    advance(1000);

    expect(getTimerButton()).toHaveTextContent("41");
    expect(getTimerButton()).toHaveClass("text-chart-1");
    expect(screen.getByText("Laps:1")).toBeInTheDocument();
  });

  it("draws the lap and rest progress segments at the rest boundary", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(10000);

    expect(getTimerButton()).toHaveTextContent("5");
    expect(queryProgressSegment("bg-chart-1")).toBeNull();

    advance(36000);

    expect(getTimerButton()).toHaveTextContent("41");

    const lapSegment = getProgressSegment("bg-destructive");
    const restSegment = getProgressSegment("bg-chart-1");

    expect(parsePercent(lapSegment.style.width)).toBeCloseTo(66.67, 1);
    expect(parsePercent(restSegment.style.width)).toBeCloseTo(1.67, 1);
    expect(parsePercent(restSegment.style.left)).toBeCloseTo(66.67, 1);
  });

  it("keeps the lap count until the next rest begins", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(46000);
    expect(screen.getByText("Laps:1")).toBeInTheDocument();

    advance(59000);
    expect(getTimerButton()).toHaveTextContent("40");
    expect(getTimerButton()).toHaveClass("text-primary");
    expect(screen.getByText("Laps:1")).toBeInTheDocument();

    advance(1000);
    expect(getTimerButton()).toHaveTextContent("41");
    expect(getTimerButton()).toHaveClass("text-chart-1");
    expect(screen.getByText("Laps:2")).toBeInTheDocument();
  });

  it("resets to idle on stop and can start over", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(65000);
    expect(screen.getByText("Laps:1")).toBeInTheDocument();

    await user.click(getTimerButton());

    expect(getTimerButton()).toHaveTextContent("0");
    expect(getTimerButton()).toHaveClass("text-muted-foreground");
    expect(screen.getByText("Laps:0")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();

    await user.click(getTimerButton());
    advance(1000);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(getTimerButton()).toHaveTextContent("0");
  });

  it("shows the current settings in the dialog", async () => {
    const user = setupUser();
    render(<App />);

    await openSettings(user);

    expect(screen.getByLabelText("Overall time")).toHaveValue(60);
    expect(screen.getByLabelText("Lap time")).toHaveValue(40);
    expect(screen.getByLabelText("Warmup time")).toHaveValue(5);
  });

  it("applies edited settings and stops a running timer", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(6000);
    expect(getTimerButton()).toHaveTextContent("1");

    await openSettings(user);
    await editSettings(user, { overallTime: 90, lapTime: 20, warmupTime: 2 });
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(getTimerButton()).toHaveTextContent("0");
    expect(getTimerButton()).toHaveClass("text-muted-foreground");
    expect(screen.getByText("Laps:0")).toBeInTheDocument();

    await openSettings(user);

    expect(screen.getByLabelText("Overall time")).toHaveValue(90);
    expect(screen.getByLabelText("Lap time")).toHaveValue(20);
    expect(screen.getByLabelText("Warmup time")).toHaveValue(2);
  });

  it("discards edits when the dialog is closed", async () => {
    const user = setupUser();
    render(<App />);

    await openSettings(user);
    const overallInput = screen.getByLabelText("Overall time");
    await user.clear(overallInput);
    await user.type(overallInput, "90");
    await user.click(within(overallInput.closest("form") as HTMLFormElement).getByRole("button", { name: "Close" }));

    expect(screen.queryByLabelText("Overall time")).not.toBeInTheDocument();

    await openSettings(user);

    expect(screen.getByLabelText("Overall time")).toHaveValue(60);
  });

  it("refreshes the display when the page becomes visible again", async () => {
    const user = setupUser();
    render(<App />);

    await user.click(getTimerButton());
    advance(5000);
    expect(getTimerButton()).toHaveTextContent("0");

    vi.setSystemTime(Date.now() + 3000);

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(getTimerButton()).toHaveTextContent("3");
  });

  it("counts a lap when the display wraps to 0 with equal lap and overall times", async () => {
    const user = setupUser();
    render(<App />);

    await openSettings(user);
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}");
    await user.click(screen.getByRole("option", { name: "45 secs" }));
    const warmupInput = screen.getByLabelText("Warmup time");
    await user.clear(warmupInput);
    await user.type(warmupInput, "0");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await user.click(getTimerButton());
    advance(44000);

    expect(getTimerButton()).toHaveTextContent("44");
    expect(screen.getByText("Laps:0")).toBeInTheDocument();

    advance(1000);

    expect(getTimerButton()).toHaveTextContent("0");
    expect(screen.getByText("Laps:1")).toBeInTheDocument();
  });
});
