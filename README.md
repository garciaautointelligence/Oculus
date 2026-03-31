<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Oculus - Garcia Intelligence

App de análise de mercado e presença digital. A integração de dados é feita via n8n (webhook) e o produto é chamado Oculus, alimentado por Garcia Intelligence.

Webhook n8n de referência:
`https://auris-intelligence.app.n8n.cloud/webhook/oculus`

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
