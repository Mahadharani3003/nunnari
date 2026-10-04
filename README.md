# NUNNARI AI

## Description
NUNNARI AI is a complete, production-ready generic-purpose GenAI chatbot built for Version 1. It offers a clean, intelligent, and professional chat interface capable of multi-turn conversations, powered by the Google Gemini API.

## Features
- Multi-turn conversation capability.
- Clean and responsive modern UI with a polished dark theme.
- Markdown and code snippet rendering.
- Copy and regenerate message functionalities.
- Empty state with example prompts.
- Graceful error handling and loading indicators.
- Server-side API key handling for safety.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Lucide React (Icons).
- **AI Integration:** Google Gemini API.
- **Backend:** Next.js Route Handlers.

## Architecture
```
User
  ↓
Next.js Chat UI
  ↓
POST /api/chat
  ↓
Gemini API
  ↓
AI Response
  ↓
Chat UI
```

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd nunnari-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables (see below).

4. Run the development server:
   ```bash
   npm run dev
   ```

### Environment Variables
Create a file named `.env.local` in the root of the project and add your Gemini API key:
```env
GEMINI_API_KEY=your_key_here
```

### Gemini API Setup
You can get a free API key from Google AI Studio. 
The API key must remain in `.env.local` and is only accessed on the server via Next.js API Routes.

## Vercel Deployment
1. Push the project to GitHub.
2. Open Vercel and Import the GitHub repository.
3. In the Vercel dashboard, go to the Environment Variables settings.
4. Add `GEMINI_API_KEY` with your actual key.
5. Click **Deploy**.
6. Open the deployed URL and test the chatbot!

## Project Structure
- `src/app`: Contains Next.js pages and API routes.
- `src/components/chat`: Reusable chat UI components.
- `src/lib/ai`: AI integration logic and system prompts.
- `src/types`: TypeScript definitions.

## Limitations
- **Version 1**: The current version does not include conversation persistence (chat history is lost on refresh).
- No file upload, RAG, Web Search, or Agents are implemented in Version 1.

## Future Improvements
- **VERSION 2:** Conversation persistence and chat history (Database integration).
- **VERSION 3:** File upload and document understanding.
- **VERSION 4:** Web search capabilities.
- **VERSION 5:** Tool calling.
- **VERSION 6:** Dedicated AI Agents.
- **VERSION 7:** Multi-agent system workflows.
