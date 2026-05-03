# TabSweep - Chrome Tab Manager

A beautiful and simple Chrome extension to manage and clean your browser tabs.

![TabSweep](extension/icons/icon128.png)

## Features

✨ **Clean Tab Management** - View and manage all your tabs in a beautiful card-based interface

🔄 **Dual View Modes** - Switch between "All Tabs" view and "By Window" grouping

📌 **Read Later** - Save tabs for later with local storage persistence

🗂️ **Archive System** - Archive and permanently delete saved tabs

🎯 **Quick Navigation** - Click any tab card to instantly switch to that tab

🔒 **Privacy First** - All data stored locally, no cloud sync

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tab-sweep.git
   ```

2. Install dependencies:
   ```bash
   cd tab-sweep
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Open Chrome and navigate to `chrome://extensions`

5. Enable "Developer mode" (toggle in the top right)

6. Click "Load unpacked" and select the `extension` folder

### For Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
```

## Usage

### Managing Tabs

- **View All Tabs**: See all open tabs in a card grid layout
- **View by Window**: Group tabs by their browser window
- **Switch Tabs**: Click any tab card to instantly switch to that tab
- **Close Tabs**: Click the × button on any tab card to close it
- **Save for Later**: Click the checkmark button to save a tab for reading later

### Read Later Panel

- **Save Tabs**: Click the checkmark button on any tab card
- **View Saved**: Access saved tabs from the right-side panel
- **Open Saved**: Click any saved item to open it in a new tab
- **Archive**: Mark items as archived after reading
- **Delete**: Permanently remove archived items

## Technical Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend build tool
- **Pinia** - Intuitive store for Vue
- **Chrome Extension MV3** - Latest Chrome extension manifest

## Project Structure

```
tab-manager-plugin/
├── src/
│   ├── components/
│   │   ├── TabCard.vue      # Tab card component
│   │   ├── ViewToggle.vue   # View mode switcher
│   │   └── ReadLater.vue    # Read later panel
│   ├── stores/
│   │   └── tabStore.js      # Pinia store for tabs
│   ├── App.vue              # Main app component
│   └── main.js              # Entry point
├── extension/
│   ├── manifest.json        # Chrome extension config
│   ├── background.js        # Service worker
│   └── icons/               # Extension icons
├── package.json
├── vite.config.js
└── README.md
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Tab | `Ctrl/Cmd + T` |
| Close Tab | `Ctrl/Cmd + W` |
| Switch to Tab | `Ctrl/Cmd + 1-9` |

## License

MIT License - feel free to use and modify!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Inspired by [tab-out](https://github.com/zarazhangrui/tab-out) - Thank you for the great idea!
