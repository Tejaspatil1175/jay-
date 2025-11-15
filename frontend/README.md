# Finora AI - Frontend Documentation

## 🎨 Overview
This is a modern, responsive web frontend for the Finora AI Investment Analyst platform. Built with pure HTML, CSS, and JavaScript (no frameworks), it provides a clean, professional interface for financial analysis.

## 📁 Structure
```
frontend/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Complete styling (light theme)
├── js/
│   ├── api.js         # API service layer
│   ├── chart.js       # Chart.js utilities
│   └── app.js         # Main application logic
└── assets/            # Images/icons (if needed)
```

## 🚀 Quick Start

### 1. Backend Setup (Required)
Make sure your backend is running on `http://localhost:5000`

Add these variables to your backend `.env` file:
```env
# Authentication Credentials (Frontend Login)
AUTH_EMAIL=admin@finora.ai
AUTH_PASSWORD=finora2024

# Existing backend variables
MONGO_URI=your_mongodb_connection_string
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
CORS_ORIGIN=*
```

### 2. Start Backend Server
```bash
cd backend
npm start
# or
npm run dev
```

### 3. Open Frontend
Simply open `frontend/index.html` in your browser, or use a local server:

**Option A: Using Live Server (VS Code Extension)**
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

**Option B: Using Python**
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

**Option C: Using Node.js**
```bash
cd frontend
npx http-server -p 8080
# Open http://localhost:8080
```

## 🔐 Default Login Credentials
```
Email: admin@finora.ai
Password: finora2024
```

⚠️ **Security Note**: These credentials are hardcoded in the frontend for demo purposes. In production, implement proper authentication with the backend.

## ✨ Features

### 1. **Authentication System**
- Secure login screen
- Session-based authentication (sessionStorage)
- Protected routes

### 2. **Company Search**
- Search by stock symbol (e.g., AAPL, GOOGL)
- Quick access buttons for popular stocks
- Real-time data fetching from backend

### 3. **Dashboard**
- Key financial metrics display
- Market cap, PE ratio, EPS, etc.
- 90-day stock price chart (Chart.js)
- AI-powered analysis summary
- Risk assessment badges
- Strengths and concerns lists

### 4. **AI Chat Assistant**
- Interactive chatbot for financial queries
- Context-aware responses about selected company
- Clean, modern chat interface
- Typing indicators

### 5. **Responsive Design**
- Works on desktop, tablet, and mobile
- Adaptive layouts using CSS Grid & Flexbox
- Touch-friendly interface

## 🎨 Design Features

### Color Scheme (Light Theme)
- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #06B6D4 (Cyan)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Danger**: #EF4444 (Red)
- **Background**: #F9FAFB (Light gray)

### UI Components
- Gradient backgrounds
- Card-based layouts
- Smooth animations
- Shadow effects
- Modern typography

## 🔌 API Integration

The frontend connects to these backend endpoints:

```javascript
GET  /api/company/:symbol          // Get company data
POST /api/analyze/:symbol          // Analyze company with AI
GET  /api/company/:symbol/refresh  // Refresh data
POST /api/chat                     // Chat with AI
GET  /api/company                  // Get all companies
```

### API Configuration
Located in `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Change this if your backend runs on a different port.

## 📊 Chart Configuration

Using Chart.js for data visualization:
- Line charts for stock price history
- Bar charts for metrics comparison
- Customizable colors and animations

## 🛠️ Customization

### Changing Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary: #4F46E5;
    --secondary: #06B6D4;
    /* ... more variables */
}
```

### Changing Login Credentials
Edit in `js/app.js`:
```javascript
const validEmail = 'your-email@domain.com';
const validPassword = 'your-secure-password';
```

### Adding More Metrics
Edit the `renderDashboard()` method in `js/app.js`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should show error)
- [ ] Search for valid stock symbol (AAPL, GOOGL, MSFT)
- [ ] Search for invalid symbol (should show error)
- [ ] View dashboard with metrics
- [ ] Check stock price chart renders
- [ ] Send chat message
- [ ] Navigate between tabs
- [ ] Refresh company data
- [ ] Logout

## 🐛 Troubleshooting

### Issue: "Failed to fetch" error
**Solution**: Make sure backend is running on port 5000

### Issue: CORS error
**Solution**: Add `CORS_ORIGIN=*` to backend `.env` file

### Issue: Charts not showing
**Solution**: Check if Chart.js CDN is accessible in `index.html`

### Issue: Login not working
**Solution**: Verify credentials match what's in the frontend code

### Issue: Blank dashboard
**Solution**: Check browser console for errors, ensure valid stock symbol

## 📱 Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Considerations

### Current Implementation (Demo)
- ⚠️ Credentials hardcoded in frontend
- ⚠️ No encryption for passwords
- ⚠️ Session stored in sessionStorage

### Production Recommendations
1. Implement JWT authentication with backend
2. Use HTTPS for all connections
3. Add password hashing (bcrypt)
4. Implement rate limiting
5. Add CSRF protection
6. Use secure cookies instead of sessionStorage
7. Environment-based configuration

## 🎯 Future Enhancements

### Planned Features
- [ ] User registration
- [ ] Watchlist/favorites
- [ ] Multiple portfolios
- [ ] Real-time stock updates (WebSocket)
- [ ] Email alerts
- [ ] PDF report export
- [ ] Dark mode toggle
- [ ] More chart types
- [ ] Historical comparison
- [ ] News integration

### UI Improvements
- [ ] Loading skeletons
- [ ] Better error messages
- [ ] Offline mode
- [ ] Progressive Web App (PWA)
- [ ] Accessibility improvements (ARIA labels)

## 📝 Code Structure

### Main Application Flow
```
1. User opens index.html
2. Login screen appears
3. User enters credentials
4. Credentials validated (frontend only for now)
5. Main app loads
6. User searches for company
7. API fetches data from backend
8. Dashboard renders with metrics and charts
9. User can chat with AI about the company
10. User can logout
```

### Key Classes
- `FinoraApp`: Main application controller
- `APIService`: Handles all API calls
- `ChartManager`: Manages Chart.js instances

## 🤝 Contributing
This frontend is part of the Finora AI Investment Analyst project.

## 📄 License
MIT License - Part of Finora AI Platform

## 👥 Credits
- **UI Design**: Custom light theme
- **Charts**: Chart.js
- **Icons**: Font Awesome 6
- **Backend**: Finora AI API (Node.js + Express)

---

## 🎓 For Developers

### Adding a New Tab
1. Add navigation link in `index.html`:
```html
<a href="#" class="nav-link" data-tab="newtab">New Tab</a>
```

2. Add tab content:
```html
<section id="newtabTab" class="tab-content">
    <!-- Your content -->
</section>
```

3. No JS changes needed - tab switching is automatic!

### Adding a New API Endpoint
1. Add method to `js/api.js`:
```javascript
async getNewData() {
    return this.request('/new-endpoint');
}
```

2. Use in `js/app.js`:
```javascript
const data = await api.getNewData();
```

### Creating Custom Charts
Use the `ChartManager` class:
```javascript
chartManager.createLineChart('canvasId', labels, data, 'Chart Title');
```

---

**Need Help?** Check the browser console for errors or contact the development team.

**Version**: 1.0.0  
**Last Updated**: November 2024
