# React + Vite + JSX Frontend

This React application has been successfully converted from Create React App to Vite with JSX.

## Changes Made

### 1. Package Configuration
- Replaced `react-scripts` with `vite` and `@vitejs/plugin-react`
- Updated scripts in `package.json`:
  - `start` → `dev` (Vite development server)
  - `build` → `build` (Vite build)
  - Added `preview` for preview of production build
  - `test` → `test` (using Vitest instead of Jest)
- Added `"type": "module"` for ES modules support

### 2. File Structure Updates
- Moved `index.html` from `public/` to root directory
- Updated `index.html` to use Vite's entry point `/src/main.jsx`
- Renamed `src/index.js` to `src/main.jsx`
- Converted all `.js` component files to `.jsx`
- Updated all imports to include `.jsx` extensions

### 3. Configuration Files
- Added `vite.config.js` for Vite configuration
- Added `vitest.config.js` for testing configuration
- Added `src/test-setup.js` for test environment setup

### 4. Removed Files
- Removed Create React App specific files:
  - `src/reportWebVitals.js`
  - `src/setupTests.js`
  - `src/App.test.js`
  - `public/index.html` (moved to root)

### 5. Updated Imports
- All component imports now use `.jsx` extensions
- Service imports use `.js` extensions
- Removed React.StrictMode wrapper simplification in `main.jsx`

## Available Scripts

- `npm run dev` - Start development server (replaces `npm start`)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests with Vitest

## Benefits of Vite

1. **Faster Development** - Much faster hot module replacement (HMR)
2. **Faster Build Times** - Uses Rollup for optimized production builds
3. **Modern Tooling** - Built-in support for TypeScript, JSX, CSS modules
4. **Smaller Bundle Size** - Better tree-shaking and optimization
5. **Native ES Modules** - No bundling in development for instant server start

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start on `http://localhost:3000` (or the next available port).
