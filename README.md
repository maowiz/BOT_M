# 🤖 BOT_M

**Your AI-Powered Chatbot Platform** — Train custom AI chatbots with your own content using advanced RAG (Retrieval-Augmented Generation).

![BOT_M Banner](https://img.shields.io/badge/BOT__M-AI%20Chatbot%20Platform-7c3aed?style=for-the-badge&logo=robot&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)

---

## ✨ Features

- 🔗 **Advanced Web Crawling** — Scrape entire websites with Crawl4AI integration
- 📄 **Document Upload** — Support for PDF, DOCX, TXT, and more
- 💬 **RAG-Powered Chat** — Accurate answers from your own content
- 🎨 **Galaxy UI Theme** — Stunning purple space-themed interface
- 🔌 **Embed Widget** — Add chatbot to any website with one script tag
- 🔐 **Multi-User Support** — Role-based access control
- 🌐 **Multiple LLM Support** — OpenAI, Groq, Ollama, and more

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/maowiz/BOT_M.git
cd BOT_M

# Install dependencies
yarn setup

# Start development servers
yarn dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 🏗️ Architecture

```
BOT_M/
├── frontend/          # React frontend (Vite)
├── server/            # Node.js backend API
├── collector/         # Document processor & web crawler
└── embed/             # Embeddable chat widget
```

---

## ⚙️ Configuration

Create a `.env` file in the `server/` directory:

```env
# LLM Provider (choose one)
LLM_PROVIDER=groq
GROQ_API_KEY=your_api_key

# Embedder
EMBEDDING_MODEL_PREF=native

# Vector Database
VECTOR_DB=lancedb
```

---

## 📦 Deployment

### Free Hosting Options

| Platform | Type | Free Tier |
|----------|------|-----------|
| [Railway](https://railway.app) | Full App | ✅ $5 credit/month |
| [Render](https://render.com) | Full App | ✅ Limited hours |
| [Fly.io](https://fly.io) | Full App | ✅ 3 VMs free |
| [Koyeb](https://koyeb.com) | Full App | ✅ 2 services |

### Docker Deployment

```bash
docker-compose up -d
```

---

## 🎨 Customization

BOT_M features a stunning **Purple Galaxy Theme** with:
- Dynamic twinkling stars
- Animated shooting stars
- Glassmorphism UI elements
- Nebula background effects

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**maowiz** — [GitHub](https://github.com/maowiz)

---

<p align="center">
  <b>BOT_M</b> — Your AI, Your Data, Your Control 🚀
</p>
