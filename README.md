# 🤖 AI-Powered Helpdesk System

An intelligent helpdesk management system powered by Google Gemini AI, featuring automatic agent assignment, semantic search, priority scoring, and intelligent ticket analysis.

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [AI Components](#-ai-components)
- [API Endpoints](#-api-endpoints)
- [Frontend Features](#-frontend-features)
- [Usage Guide](#-usage-guide)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

## 🚀 Features

### 🧠 AI-Powered Features
- **Intelligent Agent Assignment**: AI analyzes ticket content and recommends best-suited agents based on expertise
- **Semantic Search**: ChromaDB-powered vector search for similar complaints and tickets
- **Priority Scoring**: Automatic priority assessment (1-10 scale) based on ticket urgency and impact
- **Text Summarization**: AI-generated summaries of ticket content for quick review
- **Query Resolution**: Intelligent chatbot for instant query resolution

### 📊 Management Features
- **Multi-Role System**: Admin, Agent, and User roles with different permissions
- **Category Management**: Organize tickets by categories with agent assignments
- **Real-time Notifications**: Live notification system for ticket updates
- **Advanced Analytics**: Comprehensive dashboard with ticket statistics and trends
- **Bulk Operations**: Mass ticket assignment and status updates

### 🎨 User Interface
- **Modern Dark Theme**: Professional UI with responsive design
- **Real-time Updates**: Live data refresh without page reloads
- **Interactive Dashboards**: Visual analytics and reporting
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Accessibility**: WCAG compliant design for inclusive usage

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Node.js API    │    │  Flask AI Server│
│    (Port 3000)  │────│   (Port 5000)   │────│   (Port 8080)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TailwindCSS   │    │    MongoDB      │    │   ChromaDB      │
│   Styling       │    │   Database      │    │ Vector Store    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Google Gemini  │
                       │   AI Model      │
                       └─────────────────┘
```

## 💻 Technology Stack

### Frontend (React)
- **React 18** - Modern UI framework with hooks
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Context API** - State management

### Backend (Node.js)
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling

### AI Server (Flask/Python)
- **Flask** - Lightweight web framework
- **Google Gemini AI** - Large language model
- **ChromaDB** - Vector database for semantic search
- **NumPy** - Scientific computing
- **python-dotenv** - Environment variable management

### Database & Storage
- **MongoDB** - Primary database for user data, tickets, categories
- **ChromaDB** - Vector database for semantic search
- **Azure Blob Storage** - File storage (optional)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Clone Repository
```bash
git clone https://github.com/Ritam-Vaskar/helpdesk-odoo.git
cd helpdesk-odoo/helpdesk
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
FLASK_SERVER_URL=http://localhost:8080
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Flask AI Server Setup
```bash
cd ../flask_server
pip install -r requirements.txt
```

Create `.env` file in flask_server directory:
```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
CHROMA_PERSIST_PATH=./chroma_db
```

### 5. Start All Services

**Terminal 1 - MongoDB**
```bash
mongod
```

**Terminal 2 - Flask AI Server**
```bash
cd flask_server
python main.py
```

**Terminal 3 - Node.js Backend**
```bash
cd server
npm run dev
```

**Terminal 4 - React Frontend**
```bash
cd client
npm start
```

## 🧠 AI Components

### 1. Intelligent Agent Assignment

**Location**: `flask_server/utils/priority_user.py`

The system analyzes ticket content and matches it with agent expertise:

```python
def get_priority_users(users_data, question, top_n=None):
    """
    Analyzes ticket content against agent expertise
    Returns ranked list of best-suited agents
    """
    analyzed_users = analyze_user_expertise(users_data, question)
    return sorted_recommendations
```

**Process**:
1. Extract keywords from ticket title and description
2. Compare with agent's solved query history
3. Calculate relevance score (0-10 scale)
4. Rank agents by expertise match
5. Return top recommendations with reasoning

**API Endpoint**: `POST /priority-users`

**Request**:
```json
{
  "question": "How to fix laptop battery not charging properly?",
  "top_n": 5,
  "users": [
    {
      "userId": "agent123",
      "expertise_domain": "Hardware Troubleshooting",
      "Solved queries": [
        "How to fix laptop charging issues?",
        "Laptop battery replacement guide"
      ]
    }
  ]
}
```

**Response**:
```json
{
  "question": "How to fix laptop battery not charging properly?",
  "priority_users": [
    {
      "userId": "agent123",
      "relevance_score": 8,
      "reasoning": "High relevance - user has strong expertise in this domain",
      "matching_queries": ["How to fix laptop charging issues?"],
      "total_solved_queries": 15
    }
  ],
  "summary": {
    "highest_score": 8,
    "most_relevant_user": "agent123"
  }
}
```

### 2. Semantic Search with ChromaDB

**Location**: `flask_server/utils/store.py`

Vector-based search for finding similar tickets and complaints:

```python
def search_similar_complaints(query, k=5, similarity_threshold=1.2):
    """
    Performs semantic search using ChromaDB
    Returns similar complaints with similarity scores
    """
    results = collection.query(
        query_texts=[query],
        n_results=k,
        include=['documents', 'distances', 'metadatas']
    )
    return filtered_results
```

**Features**:
- **Vector Embeddings**: Converts text to numerical vectors
- **Similarity Matching**: Finds semantically similar content
- **Threshold Filtering**: Only returns results above similarity threshold
- **Metadata Support**: Includes additional context (category, priority, etc.)

**API Endpoint**: `POST /search_similar_complaints`

### 3. Priority Scoring System

**Location**: `flask_server/utils/priority_prediction.py`

AI-powered priority assessment for incoming tickets:

```python
def get_priority_score(complaint_text):
    """
    Analyzes ticket content and assigns priority score (1-10)
    Higher scores indicate more urgent issues
    """
    prompt = f"""
    Analyze this support ticket and assign a priority score from 1-10:
    - 1-3: Low priority (general questions, minor issues)
    - 4-6: Medium priority (moderate impact, non-critical)
    - 7-10: High priority (critical issues, system down, security)
    
    Ticket: {complaint_text}
    """
    score = extract_numeric_score(ai_response)
    return score
```

**Factors Considered**:
- **Urgency Keywords**: "urgent", "critical", "down", "broken"
- **Business Impact**: System outages, security issues
- **User Language**: Tone and emphasis indicators
- **Issue Severity**: Based on described symptoms

### 4. Text Summarization

**Location**: `flask_server/utils/summary.py`

Generates concise summaries of lengthy ticket descriptions:

```python
def summarize_text(content):
    """
    Creates professional summary of ticket content
    Maintains key information while reducing length by 70%
    """
    prompt = f"""
    Summarize this support ticket professionally:
    - Extract main issues and requested actions
    - Use formal, objective language
    - Provide plain text (no markdown formatting)
    - Keep 25-30% of original length
    
    Ticket: {content}
    """
    return clean_markdown(ai_response.text)
```

## 🌐 API Endpoints

### Backend API (Node.js - Port 5000)

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Assign ticket to agent
- `GET /api/tickets/agent/:agentId` - Get agent's tickets

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id/tickets` - Get category tickets

#### Users
- `GET /api/users/role/:role` - Get users by role
- `POST /api/users/priority-analysis` - Get AI agent recommendations
- `PUT /api/users/:id/role` - Update user role

#### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read

### Flask AI Server (Python - Port 8080)

#### AI Analysis
- `POST /summarize` - Generate text summary
- `POST /priority_score` - Get priority score (1-10)
- `POST /priority-users` - Get recommended agents
- `POST /add_complaint` - Store complaint in vector DB
- `POST /search_similar_complaints` - Semantic search
- `POST /chat` - AI chatbot for query resolution

## 🎨 Frontend Features

### Admin Dashboard
- **Ticket Overview**: Visual statistics and trend analysis
- **Agent Management**: Assign roles and manage agent workloads
- **Category Administration**: Create and manage ticket categories
- **AI Insights**: View AI recommendations and system performance

### Agent Interface
- **My Tickets**: Personal ticket queue with priority sorting
- **AI Assistant**: Get AI recommendations for ticket resolution
- **Ticket Search**: Find similar past issues for reference
- **Quick Actions**: Bulk status updates and assignments

### User Portal
- **Submit Tickets**: Easy ticket creation with category selection
- **Track Progress**: Real-time status updates and notifications
- **History**: View past tickets and resolutions
- **AI Chatbot**: Instant help for common queries

### Key UI Components

#### Intelligent Agent Assignment
```jsx
// ManageCategories.jsx - AI recommendation display
<div className="bg-gray-600 rounded-lg p-3">
  <h4 className="text-blue-400 mb-2">🤖 AI Recommended Agents:</h4>
  {aiRecommendations.map((rec, idx) => (
    <div key={idx} className="bg-gray-700 p-2 rounded">
      <div className="font-medium">{rec.name}</div>
      <div className="text-sm opacity-75">{rec.reasoning}</div>
      <div className="text-xs text-blue-400">
        Score: {rec.relevance_score}/10
      </div>
    </div>
  ))}
</div>
```

#### Semantic Search Interface
```jsx
// ManageByAgent.jsx - AI search functionality
<div className="bg-gray-800 p-4 rounded-lg">
  <h3 className="text-white mb-4">🤖 AI Complaint Search</h3>
  <input 
    placeholder="Search for similar complaints..."
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <button onClick={searchSimilarComplaints}>AI Search</button>
</div>
```

## 📖 Usage Guide

### For Administrators

1. **Initial Setup**
   - Create agent accounts and assign roles
   - Set up ticket categories and agent assignments
   - Configure AI server connection

2. **Daily Operations**
   - Review AI recommendations for ticket assignments
   - Monitor agent workloads and performance
   - Analyze system metrics and reports

3. **AI Management**
   - Use "🤖 AI Assign Agent" for intelligent assignments
   - Review AI reasoning and match scores
   - Adjust agent expertise profiles based on performance

### For Agents

1. **Ticket Handling**
   - Access assigned tickets through agent dashboard
   - Use AI assistant for similar case references
   - Update ticket status and add resolution notes

2. **AI Assistance**
   - Click "🤖 AI Assist" for ticket analysis
   - Review AI-generated summaries for quick understanding
   - Search for similar past cases using semantic search

### For Users

1. **Ticket Submission**
   - Create tickets with detailed descriptions
   - Select appropriate categories
   - AI automatically assigns priority scores

2. **Tracking**
   - Monitor ticket progress in real-time
   - Receive notifications for status updates
   - Use AI chatbot for immediate assistance

## 🔧 Environment Variables

### Server (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/helpdesk

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Server Configuration
PORT=5000
NODE_ENV=development

# AI Integration
FLASK_SERVER_URL=http://localhost:8080

# File Storage (Optional)
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
```

### Client (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### Flask Server (.env)
```env
# Google AI
GOOGLE_API_KEY=your_google_gemini_api_key_here

# ChromaDB
CHROMA_PERSIST_PATH=./chroma_db

# Server Configuration
FLASK_PORT=8080
FLASK_DEBUG=true
```

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests  
cd client
npm test

# AI server tests
cd flask_server
python -m pytest tests/
```

### API Testing
Use the provided test components:
- `AITestComponent.jsx` - Test AI endpoints
- `flask_server/test.py` - Test Flask API

### Integration Testing
1. Start all services
2. Navigate to test pages in the application
3. Verify AI recommendations are working
4. Test ticket assignment flow
5. Validate semantic search results

## 🔍 Troubleshooting

### Common Issues

#### AI Server Connection Failed
```bash
# Check Flask server status
curl http://localhost:8080/health

# Verify Google API key
python -c "import google.generativeai as genai; genai.configure(api_key='your_key'); print('API key valid')"
```

#### ChromaDB Permission Issues
```bash
# Fix permissions
chmod -R 755 ./flask_server/chroma_db
```

#### MongoDB Connection Failed
```bash
# Check MongoDB status
mongosh --eval "db.runCommand({connectionStatus : 1})"
```

#### Frontend Build Issues
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // Add indexes for frequently queried fields
   db.tickets.createIndex({"assignedTo": 1, "status": 1})
   db.users.createIndex({"role": 1, "expertise": 1})
   ```

2. **AI Response Caching**
   - Cache frequent AI responses
   - Implement request deduplication
   - Use Redis for session management

3. **Frontend Optimization**
   - Implement lazy loading for components
   - Use React.memo for expensive components
   - Optimize bundle size with code splitting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent text processing
- ChromaDB for vector database capabilities
- MongoDB for robust data storage
- React and Node.js communities for excellent frameworks

---

## 🚀 Quick Start Commands

```bash
# Start development environment
npm run dev:all

# Build production version
npm run build:production

# Run all tests
npm run test:all

# Deploy to production
npm run deploy
```

**Made with ❤️ by the Helpdesk AI Team**