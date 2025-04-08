# C24 View Mode Toggle Extension

A Chrome extension that allows toggling between mobile and desktop views on Check24 websites.

## Features

- Toggle between mobile and desktop view modes
- Open current page in new tab with opposite view mode
- Persistent view mode settings

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Building

To build the extension:

```bash
npm run build
```

This will:
1. Compile TypeScript files to JavaScript
2. Copy HTML and image files to the dist directory

### Development Mode

To watch for changes and automatically rebuild:

```bash
npm run watch
```

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` directory

## Usage

1. Click the extension icon in the Chrome toolbar
2. Use the toggle switch to switch between mobile and desktop views
3. Click "Open in New Tab" to open the current page in a new tab with the opposite view mode

## Project Structure

- `src/` - Source files
  - `background.ts` - Background script
  - `content.ts` - Content script
  - `popup.ts` - Popup script
  - `popup.html` - Popup UI
- `dist/` - Built files (generated)
- `manifest.json` - Extension manifest
- `*.png` - Extension icons

## License

ISC 