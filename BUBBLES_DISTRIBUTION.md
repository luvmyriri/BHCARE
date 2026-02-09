# Bubble Distribution Fix 🫧

## Overview
Addressed the issue of bubbles "clumping" in the center and leaving corners (like Top-Left) blank.

## Changes Made

1.  **Stratified Sampling (Zones):**
    *   Instead of purely random locations (which can streak), I implemented a **Zone System**.
    *   **Zone 0:** Top-Left (-10% to 20%).
    *   **Zone 1:** Top-Right (70% to 100%).
    *   **Zone 2:** Bottom-Left (-10% to 20%).
    *   **Zone 3:** Bottom-Right (70% to 100%).
    *   **Zone 4:** Center / Random (10% to 90%).

2.  **Logic:**
    *   The particle generator assigns each new bubble to a zone in sequence (`index % 5`).
    *   This guarantees that **at least 20% of bubbles** spawn in the Top-Left corner, fixing the "blank space" issue.

## Result
The background should now be evenly filled with large, drifting bubbles, providing full screen coverage without dense or empty patches. 🚀
