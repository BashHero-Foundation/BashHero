import { describe, it, expect } from "vitest";
import CalculatePoints from "@/components/CalculatePoints";

// args: accuracy, wpm, maxPoints, minWPM, minAccuracy
describe("CalculatePoints", () => {
  it("gives full point total when both criteria are met", () => {
    expect(CalculatePoints(90, 30, 5, 25, 80)).toBe(5);
  });

  it("borders on the minimum values are included and counted correctly", () => {
    expect(CalculatePoints(80, 25, 5, 25, 80)).toBe(5);
  });

  it("gives 4 out of 5 points when one criterion is met", () => {
    expect(CalculatePoints(90, 10, 5, 25, 80)).toBe(4);
  });

  it("gives 3 out of 5 points when no criteria are met", () => {
    expect(CalculatePoints(50, 10, 5, 25, 80)).toBe(3);
  });
});