<div align="center">
  <img src="./icons/icon128.png" width="128" height="128" alt="ChatGPT Voyager Logo" />
  <h1>ChatGPT Voyager</h1>
  <p>An all-in-one enhancement suite for ChatGPT web interface.</p>
</div>

## ✨ About
**ChatGPT Voyager** is a powerful Chrome Extension designed to supercharge your daily workflow on `chatgpt.com`. Inspired by the [gemini-voyager](https://github.com/Nagi-ovo/gemini-voyager) project, this extension brings indispensable organization, extraction, and navigation tools directly into the native ChatGPT interface. 

Whether you're juggling dozens of conversations, managing complex prompts, dealing with long o-series reasoning outputs, or extracting math formulas, ChatGPT Voyager streamlines everything seamlessly. All data is stored locally in your browser to strictly guarantee privacy.

## 🚀 Key Features

### 📁 Chat Organization
* **Folders**: Two-level folder hierarchy injected directly into the left sidebar. Organize your chats visually with color-coding and drag-and-drop support.
* **Batch Delete**: Efficiently select multiple conversations and delete them at once.
* **Hide Recents**: Option to hide the default "Today / Yesterday / Previous 7 Days" time groupings for a cleaner sidebar look.

### 🧰 Power Tools
* **Prompt Vault**: A dedicated quick-access library for saving, tagging, searching, and reusing your favorite prompts with a single click.
* **Timeline Navigation**: A visual timeline map on the right side of the screen. Easily jump between user and assistant messages in long conversations and "star" important responses.
* **Chat Export**: One-click export of the current conversation to JSON, clean Markdown, or styled PDF formats.
* **Quote Reply**: Select any text from ChatGPT's response to instantly create a formatted quote reply in the input box.
* **Default Model**: Automatically switch to your preferred model (e.g., `o1`, `GPT-4o`) every time you start a new chat.
* **Tab Title Sync**: Automatically syncs the browser tab title with the ChatGPT conversation name.

### 🧠 Output Enhancements
* **Deep Research Extractor**: For `o-series` models, effortlessly extract the hidden "Thinking..." reasoning blocks and copy all cited research URLs.
* **Formula Copy**: One-click buttons alongside rendered math equations to copy the raw `LaTeX` or `MathML` code.
* **Mermaid Rendering**: Automatically renders Mermaid code blocks as inline SVG diagrams.

### ⌨️ UI Tweaks
* **Input Collapse**: Automatically shrinks the massive text input box when it loses focus to give you more reading space.
* **Prevent Auto-Scroll**: Stops the page from forcibly scrolling to the bottom when you hit Enter to send a prompt, preserving your reading context.

## 🛠️ Installation
1. Go to the [Releases](https://github.com/hayashishungenn/chatgpt-voyager/releases) page and download `chatgpt-voyager-v1.x.x.zip`.
2. Extract the ZIP file to a folder on your computer.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle in the top right corner.
5. Click **Load unpacked** and select the extracted folder (it contains the `dist` files and `manifest.json`).
6. Navigate to [chatgpt.com](https://chatgpt.com) and start exploring!

## ⚙️ Configuration
Click the 🚀 ChatGPT Voyager icon in the Chrome extensions toolbar to open the settings menu. From there, you can toggle individual features on and off, set your default AI model, and change your preferred default export format.

## 🤝 Acknowledgements
Heavy inspiration and functional design ideas are drawn from [gemini-voyager](https://github.com/Nagi-ovo/gemini-voyager) by Nagi-ovo. 

## 📄 License
MIT License.
