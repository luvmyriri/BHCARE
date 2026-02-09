# Bubbles Update: Autonomous & Random 🫧

## Overview
Replaced the simple 3-bubble animation with a **dynamic particle system** that generates **20 floating bubbles** with randomized behavior.

## What Changed?

1.  **Count Increased:** 3 bubbles ➔ **20 bubbles**
    *   Creates a richer, impressive atmosphere.

2.  **Autonomous Movement:**
    *   Instead of repeating the same loop, each bubble now moves on its own unique path.
    *   They wander randomly across X and Y axes (drifting).
    *   They slowly rotate and pulse in size randomly.

3.  **Randomized Properties:**
    *   **Size:** Random between 50px and 350px.
    *   **Color:** Random selection from brand palette (Teal, Orange, Blue, Yellow, Purple).
    *   **Speed:** Each bubble moves at a different speed (10s - 30s cycle).

4.  **Tech Implementation:**
    *   Switched from CSS Keyframes to **Framer Motion** `animate` prop for complex coordinate generation.
    *   Implemented a `<FloatingParticles />` component in `Hero.tsx`.

## How it looks
The background is now a living, breathing space with soft, colorful orbs gently drifting in unpredictable patterns, exactly as requested! ✨
