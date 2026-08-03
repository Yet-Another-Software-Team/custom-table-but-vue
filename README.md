# Week Wizard - Modern Schedule Generator

A sleek, interactive Vue.js-based schedule management web application inspired by the [KU Schedule Generator](https://github.com/OmegaOoh/custom-table).

## ✨ Features
- **Interactive Drag & Drop Table Grid**: Drag course cards across the weekly schedule table to move them to a new day or time slot with real-time drop previews.
- **Duration Resizing**: Drag the edge of any course card directly on the grid to visually resize its duration in 30-minute steps.
- **Click-to-Add & Quick Edit**: Click any empty slot on the timetable to instantly drop a course and edit details via inline popover.
- **Conflict Detection**: Automatic visual warnings when courses overlap on the same day and time range.
- **HTML Table Import**: Parse and import raw KU HTML timetable data (supports both Thai and English structures).
- **JSON Import / Export**: Save, load, copy, or download schedule data in JSON format.
- **Modern Dark UI**: Designed with glassmorphism, custom color palettes, background glow effects, and responsive layout.

## 🚀 How to Run with Bun

### Prerequisites
- [Bun](https://bun.sh/) installed on your machine.

### Installation
```sh
cd app && bun install
```

### Running Development Server
```sh
bun run dev
```

### Building for Production
```sh
bun run build
```

## 🌐 Deploying on Vercel
This repository includes a pre-configured `vercel.json` and root `package.json` for seamless zero-config deployment on Vercel.
- **Framework Preset**: Vite
- **Build Command**: `cd app && (bun run build || npm run build)`
- **Output Directory**: `app/dist`

---
© 2026 Yet Another Software Team. Licensed under MIT.