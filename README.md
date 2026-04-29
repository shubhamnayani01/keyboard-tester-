# ⌨️ Keyboard Visualizer

A fully interactive keyboard visualizer built using **HTML, CSS, and vanilla JavaScript**.

This project displays a complete QWERTY keyboard layout and visually responds to real-time key presses using `event.code` for accurate and layout-independent detection.

---

## 🚀 Features

* Full keyboard layout:

  * Alphabet keys (A–Z)
  * Number row (0–9)
  * Function keys (F1–F12)
  * Modifier keys (Shift, Ctrl, Alt, CapsLock)
  * Special keys (Enter, Backspace, Tab, Space, Escape)
  * Arrow keys

* Real-time interaction:

  * Highlights keys on `keydown`
  * Resets on `keyup`
  * Supports multiple simultaneous key presses

* Visual enhancements:

  * Smooth transitions (CSS-based)
  * Ripple effect on press
  * Optional sound feedback
  * Key press history display

* Responsive design:

  * Works on desktop and smaller screens
  * Scales key sizes for mobile

---

## 🧠 Why `event.code` instead of `event.key`?

Using `event.key` is a common mistake.

* `event.key` depends on keyboard layout (breaks on non-QWERTY)
* `event.code` represents physical key position

Example:

* Pressing the same physical key may return different `event.key`
* But `event.code` will always be consistent (`KeyA`, `Digit1`, etc.)

This project uses `event.code` to avoid layout inconsistencies.

---

## 📁 Project Structure

```
keyboard-visualizer/
│
└── index.html   # Contains HTML, CSS, and JS
```

Single-file setup for simplicity. No build tools, no dependencies.

---

## ⚙️ How to Run

1. Download or clone the project
2. Open `index.html` in your browser

That’s it. No setup required.

---

## ⚠️ Limitations (Read This)

Don’t ignore this section.

* Not all physical keys are detectable in browsers

  * Some system-level keys are blocked by the OS/browser

* Mobile keyboards:

  * Do NOT behave like physical keyboards
  * Many keys won’t trigger `event.code`

* Sound:

  * Uses basic Web Audio API
  * Not realistic mechanical keyboard sound

If you expected hardware-level accuracy in a browser, that’s unrealistic.

---

## 🧪 Possible Improvements

If you want to push this further:

* Add RGB lighting effects per key
* Track typing speed (WPM)
* Heatmap of most-used keys
* Custom key remapping UI
* Save history to local storage
* Convert into React / Vue component

---

## 🛠 Tech Stack

* HTML5
* CSS3 (Grid + animations)
* Vanilla JavaScript (no libraries)

---

## 📜 License

Free to use, modify, and distribute.

---

## 👊 Final Note

This project is intentionally built without frameworks.

If you can’t understand or extend this, the problem isn’t the code — it’s your fundamentals.

Fix that first.
