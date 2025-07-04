# AI-teammate-for-Codebase-Insights

An intelligent AI teammate designed to provide role-specific insights from large codebases, reducing the time and effort required by software teams to extract relevant information.

## Problem Overview

In large software projects, team members often waste valuable time trying to find the information relevant to their specific roles. Each role has different needs:

- **Backend engineers** need server logic and API details.
- **Frontend developers** look for clean UI components and API usage.
- **AI engineers** focus on data pipelines and ML workflows.
- **Product managers** require high-level, jargon-free overviews for planning and communication.

Existing tools do not offer role-specific views and often require manual searching and interpretation.

## Objective

To develop an AI-powered teammate that analyzes the codebase and automatically generates customized deliverables (e.g., summaries, diagrams, resources) tailored to the needs of each user role.

## Key Features

- **Role-Based Output Detection**  
  Automatically tailors responses based on the user's role.

- **Multi-Modal Deliverables**  
  Generates UML diagrams, ERDs, and plain-language summaries.

- **Hybrid RAG Pipeline**  
  Combines retrieval-augmented generation with custom summarization for accurate and concise outputs.

- **Tool Integration**  
  Integrates with Git, and other tools using a custom MCP (Model Context Protocol) server.

- **A2A Collaboration Support**  
  Aligns outputs across agents and roles for consistent communication.

## Tech Stack

- Python / FastAPI (AI backend)
- React (Frontend)
- GitHub integrations
- LangChain / OpenAI API (LLM support)
- Custom-built MCP communication layer

## Deliverables

- ✅ AI Agent Prototype
- ✅ Complete Source Code & Documentation
- ✅ Live Demo / Presentation-ready version

## Getting Started

1. **Clone the repo:**

   ```bash
   git clone https://github.com/Megh-Zyke/AI-teammate-for-Codebase-Insights
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   cd client
   npm install
   ```

3. **Run the app:**

   - Backend:

     ```bash
     uvicorn main:app --reload
     ```

   - Frontend:

     ```bash
     cd client
     npm run dev
     ```
