# Her OS: An AI-Driven Conversational Interface

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)
![Vite](https://img.shields.io/badge/vite-5.0.0-646CFF.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini%20Pro-8E75B2.svg)

## Overview

**Her OS** is a conceptual exploration of human-AI interaction, inspired by the cinematic aesthetic of the film *Her*. This project serves as a research prototype for an emotionally resonant, voice-first operating system. It moves beyond traditional command-response paradigms to foster more organic, conversational, and empathetic engagements between users and artificial intelligence.

Developed as part of a PhD portfolio, this application demonstrates advanced integration of Large Language Models (LLMs) with real-time speech synthesis and recognition in a web-based environment.

## Key Features

### 🎙️ Organic Voice Interface
- **Real-time Interaction**: Seamless speech-to-text and text-to-speech processing for fluid conversation.
- **Visual Feedback**: A custom-designed, organic voice visualizer that reacts dynamically to audio input and processing states, mimicking the warmth and presence of a living entity.

### 📻 Co-Host "Radio" Mode
- **Collaborative Dialogue**: A unique mode where the AI acts as a podcast co-host, capable of introducing topics, engaging in banter, and providing insightful commentary on complex subjects like consciousness and art.
- **Dynamic Topic Generation**: The system can autonomously generate and shift between philosophical and creative topics.

### 🎮 Interactive Modules
- **Game Mode**: A demonstration of the AI's ability to engage in structured play (Rock, Paper, Scissors), showcasing state management and logic reasoning alongside personality.
- **Persona Switching**: Ability to toggle between distinct AI personalities ("Wendy" - warm/curious vs. "Liz" - analytical/edgy), altering both the system prompt and the visual theme.

## Technical Architecture

### Core Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations and glassmorphism effects.
- **State Management**: React Hooks (useState, useEffect, useRef).

### AI & Services
- **LLM Integration**: Google Gemini API (supporting `gemini-3-pro` and `gemini-2.5-pro`).
- **Speech Services**: Web Speech API for native browser-based recognition and synthesis, ensuring low latency and privacy.
- **Memory Management**: LocalStorage-based conversation history to maintain context across sessions.

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/her-os.git
    cd her-os
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configuration**
    - The application requires a Google Gemini API key.
    - Launch the app and click the **Settings** (gear icon) to securely input your key. It is stored locally in your browser.

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Security & Privacy

- **Local Storage**: API keys and conversation history are stored exclusively in the user's browser `localStorage`. No data is sent to any intermediate backend server.
- **Direct API Calls**: The client communicates directly with the Gemini API, minimizing exposure.
- **Source Control**: Sensitive files and logs are strictly excluded via `.gitignore`.

## Future Roadmap

- [ ] **Multimodal Input**: Integration of vision capabilities for the AI to "see" the user's environment.
- [ ] **Emotional Analysis**: Real-time sentiment analysis of the user's voice to adjust the AI's tone.
- [ ] **Long-term Memory**: Vector database integration for persistent, semantic memory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Created by Anthony Perry for PhD Portfolio Research.*
