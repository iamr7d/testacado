# Trainacado - AI-Powered Academic Outreach Platform

A comprehensive web application to help students connect with professors for research opportunities and PhD applications, powered by AI.

![Trainacado Platform](https://i.imgur.com/YourScreenshotHere.png)

## 🌟 Features

- **Professor Search & Analysis**: Find professors based on research interests and analyze their profiles
- **AI-Powered Insights**: Get AI-generated summaries and compatibility scores using Gemini AI
- **Research Compatibility Assessment**: See how well your interests align with professors' research
- **Email Template Generation**: Generate personalized outreach emails based on your profile and the professor's work
- **Publication Analysis**: View professors' publication history and citation metrics
- **Research Trend Analysis**: AI-powered analysis of research trends and future directions

## 🚀 Live Demo

Visit the live application: [Trainacado App](https://trainacado.netlify.app)

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **AI Integration**: Google Gemini AI API
- **Data Sources**: Google Scholar, university websites
- **Deployment**: Netlify (frontend), Render/Heroku (backend)

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Google Gemini API key

## 🔧 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/iamr7d/trainacado.git
   cd trainacado
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:3005
   VITE_NODE_ENV=development
   ```
   
   Create a `.env.backend` file in the root directory with the following variables:
   ```
   PORT=3005
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development servers**:
   
   For the frontend:
   ```bash
   npm run dev
   ```
   
   For the backend:
   ```bash
   npm run server
   ```

5. **Access the application**:
   
   Open your browser and navigate to `http://localhost:3000`

## 🌐 Deploying to Netlify

### Frontend Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Create a new site on Netlify
   - Connect to your GitHub repository
   - Set the build command to `npm run build`
   - Set the publish directory to `dist`
   - Add the following environment variables in Netlify's settings:
     - `VITE_API_URL`: URL of your deployed backend (e.g., https://trainacado-api.render.com)
     - `VITE_NODE_ENV`: production

### Backend Deployment

For the backend, you can use services like Render, Heroku, or Railway:

1. **Deploy the server**:
   - Create a new web service on your chosen platform
   - Connect to your GitHub repository
   - Set the start command to `node server.js`
   - Add the following environment variables:
     - `PORT`: 3000 (or as provided by the platform)
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `CORS_ORIGIN`: URL of your Netlify frontend

2. **Update CORS settings**:
   
   Ensure your backend allows requests from your Netlify domain by updating the CORS configuration in `server.js`.

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📚 API Documentation

The backend provides the following API endpoints:

- `GET /api/professors`: Get a list of professors
- `GET /api/professors/:id`: Get details of a specific professor
- `POST /api/professors/search`: Search for professors by name or university
- `POST /api/ai/matching-score`: Calculate research compatibility score
- `POST /api/ai/professor-summary`: Generate AI summary of a professor
- `POST /api/ai/research-trends`: Analyze research trends based on publications
- `POST /api/email/generate`: Generate an outreach email

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Google Gemini AI for powering the AI features
- All the open-source libraries used in this project
- Academic community for feedback and suggestions