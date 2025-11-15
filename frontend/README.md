# Finora Frontend

AI-Powered Financial Analysis Platform - React Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- Backend server running on http://localhost:5000

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will open at http://localhost:3000

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Auth/           # Authentication components
│   │   │   └── ProtectedRoute.jsx
│   │   └── Layout/         # Layout components
│   │       └── Navbar.jsx
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── companyService.js
│   │   ├── portfolioService.js
│   │   ├── documentService.js
│   │   ├── chatService.js
│   │   └── marketService.js
│   ├── utils/              # Utility functions
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables
├── .env.example            # Example env file
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Recharts** - Data visualization

## ✨ Features Implemented

### ✅ Phase 1: Foundation
- [x] Project setup with Vite
- [x] TailwindCSS configuration
- [x] API service layer with Axios
- [x] JWT token management with auto-refresh
- [x] React Router setup
- [x] Auth Context for state management

### ✅ Phase 2: Authentication
- [x] Login page with validation
- [x] Register page with validation
- [x] Protected routes
- [x] Auto token refresh on 401
- [x] Persistent authentication

### ✅ Phase 3: Dashboard
- [x] Portfolio summary cards
- [x] Holdings preview
- [x] Market movers (Gainers, Losers, Most Active)
- [x] Responsive navbar with mobile menu
- [x] Real-time data refresh

## 🔌 API Integration

All API calls go through the centralized `api.js` service which:
- Automatically adds JWT tokens to requests
- Handles token refresh on 401 errors
- Provides consistent error handling
- Supports request/response interceptors

Example:
```javascript
import { portfolioService } from './services/portfolioService';

// Get portfolio summary
const data = await portfolioService.getSummary();
```

## 🎯 Available Services

### Auth Service
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `getProfile()` - Get user profile
- `updateProfile(data)` - Update profile
- `changePassword(data)` - Change password

### Portfolio Service
- `getSummary()` - Portfolio overview
- `getHoldings()` - All holdings
- `buyStock(data)` - Create buy order
- `sellStock(data)` - Create sell order
- `getOrders(params)` - Order history

### Company Service
- `getCompany(symbol)` - Company data
- `refreshCompany(symbol)` - Refresh data
- `analyzeCompany(symbol)` - AI analysis

### Market Service
- `getMovers()` - Top gainers/losers
- `getScreener(filter)` - Market cap filter
- `searchStocks(params)` - Stock search
- `getSMA(symbol)` - SMA indicator
- `getRSI(symbol)` - RSI indicator

### Document Service
- `uploadDocument(file, category)` - Upload file
- `getDocuments(params)` - All documents
- `getDocument(id)` - Document details
- `deleteDocument(id)` - Delete document

### Chat Service
- `sendMessage(data)` - Send chat message
- `getChatHistory(sessionId)` - Chat history
- `startNewSession(symbol)` - New session
- `deleteChatHistory(sessionId)` - Delete history

## 🛠️ Utility Functions

### Formatters (`utils/formatters.js`)
- `formatCurrency(value)` - $1,234.56
- `formatNumber(value)` - 1,234.56
- `formatPercentage(value)` - +5.25%
- `formatCompactNumber(value)` - 1.5B, 25.3M
- `formatDate(date)` - Various formats
- `getChangeColor(value)` - Color based on +/-
- `formatFileSize(bytes)` - 2.5 MB

### Validators (`utils/validators.js`)
- `validateEmail(email)` - Email validation
- `validatePassword(password)` - Password rules
- `validateSymbol(symbol)` - Stock symbol
- `validatePositiveNumber(value)` - Positive check
- `validateFile(file)` - File validation

## 🎨 Styling

### TailwindCSS Configuration
Custom colors, animations, and utilities are defined in `tailwind.config.js`.

### Custom CSS
- Glassmorphism effects
- Custom scrollbar styling
- Fade-in animations
- Dark theme optimized

### Color Palette
- **Primary Blue**: #0ea5e9
- **Background**: Slate 900
- **Cards**: Slate 800 with 50% opacity
- **Borders**: Slate 700
- **Success**: Green 500
- **Error**: Red 500

## 🔐 Authentication Flow

1. User submits login/register form
2. API call made to backend
3. On success, tokens saved to localStorage
4. User data saved to Auth Context
5. Navigate to dashboard
6. On 401 error, auto-refresh token
7. If refresh fails, redirect to login

## 📱 Responsive Design

- **Mobile**: Hamburger menu, stacked cards
- **Tablet**: Responsive grid layouts
- **Desktop**: Full navbar, multi-column layouts

## 🚧 Next Steps (To Be Implemented)

### Phase 4: Portfolio Page
- [ ] Holdings table with sorting
- [ ] Buy/Sell order modals
- [ ] Position details
- [ ] P&L charts

### Phase 5: Company Page
- [ ] Company search
- [ ] Detailed company view
- [ ] Financial charts
- [ ] Technical indicators display
- [ ] AI analysis display

### Phase 6: Documents Page
- [ ] Drag-and-drop file upload
- [ ] Document list with filters
- [ ] Processing status indicator
- [ ] AI analysis visualization
- [ ] Chart rendering

### Phase 7: Chat Page
- [ ] Chat interface
- [ ] Message history
- [ ] Chart display
- [ ] Source citations
- [ ] Session management

### Phase 8: Market Page
- [ ] Stock screener
- [ ] Market cap filters
- [ ] Search functionality
- [ ] Technical indicators

## 📝 Environment Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Deploy Options
- **Vercel**: Connect GitHub repo
- **Netlify**: Drag & drop `dist` folder
- **AWS S3**: Upload `dist` to S3 bucket
- **Docker**: Use provided Dockerfile (to be added)

## 📄 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint (to be configured)
```

## 🐛 Troubleshooting

### CORS Issues
Make sure backend has proper CORS configuration:
```javascript
app.use(cors({ origin: 'http://localhost:3000' }));
```

### API Connection Refused
1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in `.env`
3. Check network tab in browser DevTools

### Token Expired
Tokens are automatically refreshed. If issues persist:
1. Clear localStorage
2. Login again

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

## 👥 Team

Built by **Team Certified Losers** 🚀

---

**Happy Coding! 🎉**
