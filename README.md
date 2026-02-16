# Her OS: An AI-Driven Conversational Interface

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)
![Vite](https://img.shields.io/badge/vite-5.0.0-646CFF.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-8E75B2.svg)

## Overview

**Her OS** is a conceptual exploration of human-AI interaction, inspired by the cinematic aesthetic of the film *Her*. This project serves as a research prototype for an emotionally resonant, voice-first operating system. It moves beyond traditional command-response paradigms to foster more organic, conversational, and empathetic engagements between users and artificial intelligence.

Developed as part of a PhD portfolio, this application demonstrates advanced integration of Large Language Models (LLMs) with real-time speech synthesis and recognition in a web-based environment.

## Research Context

This project is a PhD portfolio piece investigating the **phenomenological dimensions of human-AI relationship**. Rather than treating conversational AI as a purely utilitarian tool, Her OS examines how interaction design, persona construction, and voice modality shape the subjective experience of engaging with a language model.

The research draws on phenomenological and post-phenomenological frameworks to ask: *How do users experience presence, empathy, and rapport with an AI system, and how do deliberate design choices in persona, voice, and interface aesthetics mediate those experiences?*

## Longitudinal Study

Her OS is accompanied by a **longitudinal empirical study** spanning approximately **70 episodes** and **100+ hours** of recorded human-AI conversational interaction. The study involves:

- **Comparative evaluation** across multiple frontier LLMs, including **Gemini, Claude, ChatGPT, and Grok**, assessing differences in conversational depth, persona consistency, and emergent interaction patterns.
- **H.E.R.V.A.C. Benchmark**: A novel 6-dimension evaluation framework measuring Human-likeness, Emotional attunement, Recall continuity, Voice performance, Agency/integrity, and Co-evolution — proposing a "Relational Turing Test" that evaluates resonance over deception.
- **Adversarial stress-testing** ("Nine Circles") including sycophancy traps, silence crucibles, and persona stability tests to probe the boundaries of AI conversational competence under sustained interaction.
- **Persona design methodology** exploring how distinct AI personalities (e.g., "Wendy" — warm/curious vs. "Liz" — analytical/edgy) alter user engagement and conversational dynamics.

The full video corpus is available on YouTube: [youtube.com/@anth.onomous](https://www.youtube.com/@anth.onomous)

## Key Features

### Organic Voice Interface
- **Real-time Interaction**: Seamless speech-to-text and text-to-speech processing for fluid conversation.
- **Visual Feedback**: A custom-designed, organic voice visualizer that reacts dynamically to audio input and processing states, mimicking the warmth and presence of a living entity.
- **Synthesized UI Audio**: Web Audio API-generated tones for hover, click, and notification feedback — no external audio files.

### Co-Host "Radio" Mode
- **Collaborative Dialogue**: A unique mode where the AI acts as a podcast co-host, capable of introducing topics, engaging in banter, and providing insightful commentary on complex subjects like consciousness and art.
- **Dynamic Topic Generation**: The system can autonomously generate and shift between philosophical and creative topics.

### Interactive Modules
- **Game Mode**: A demonstration of the AI's ability to engage in structured play (Rock, Paper, Scissors), showcasing state management and logic reasoning alongside personality.
- **Persona Switching**: Toggle between distinct AI personalities ("Wendy" — warm/curious vs. "Liz" — analytical/edgy), altering both the system prompt and the full visual theme (warm oranges vs. deep purples).

### Design System
- **Glassmorphism UI**: Frosted glass panels with backdrop blur and subtle borders.
- **Ambient Motion**: Slow-drifting background orbs and grain texture overlay for cinematic depth.
- **Micro-interactions**: Framer Motion-powered hover, tap, and transition animations throughout.
- **Accessibility**: ARIA labels on all interactive elements, keyboard-navigable focus states, and `prefers-reduced-motion` compatibility via Framer Motion.

## Technical Architecture

### Core Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with custom design tokens and glassmorphism utilities.
- **Animation**: Framer Motion for declarative animations and page transitions.
- **State Management**: React Hooks (`useState`, `useEffect`, `useRef`).

### AI & Services
- **LLM Integration**: Google Gemini API (with automatic model fallback: `gemini-2.5-pro` → `gemini-2.5-flash` → `gemini-2.0-flash`). Also supports OpenAI API keys.
- **Speech Services**: Web Speech API for native browser-based recognition and synthesis, ensuring low latency and privacy.
- **Memory Management**: LocalStorage-based conversation history with automatic truncation to maintain context across sessions.
- **Audio Feedback**: Web Audio API oscillator-based UI sounds, lazy-initialized to respect browser autoplay policies.

## Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Voice Recognition | Yes | Yes | No | No |
| Speech Synthesis | Yes | Yes | Yes | Yes |
| Web Audio API | Yes | Yes | Yes | Yes |

> **Note**: Speech recognition requires `webkitSpeechRecognition`, which is currently supported in Chromium-based browsers only. The application gracefully degrades in unsupported browsers — all non-voice features remain functional.

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/aperry938/her-os-v1.git
    cd her-os-v1
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configuration**
    - Copy `.env.example` to `.env` and add your Gemini API key, **or**
    - Launch the app and click the **Settings** (gear icon) to input your key via the UI. It is stored locally in your browser.

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Security & Privacy

- **Local Storage**: API keys and conversation history are stored exclusively in the user's browser `localStorage`. No data is sent to any intermediate backend server.
- **Direct API Calls**: The client communicates directly with the Gemini/OpenAI API, minimizing exposure.
- **Source Control**: `.env`, secrets, and logs are strictly excluded via `.gitignore`.

## Future Research Directions

- **Multimodal Input**: Integration of vision capabilities for the AI to "see" the user's environment and respond to visual context.
- **Emotional Analysis**: Real-time sentiment analysis of the user's voice to dynamically adjust the AI's tone and conversational strategy.
- **Long-term Memory**: Vector database integration for persistent, semantic memory across sessions.
- **Cross-model Persona Fidelity**: Systematic study of how the same persona prompt manifests differently across LLM providers.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Created by Anthony Perry for PhD Portfolio Research.*
