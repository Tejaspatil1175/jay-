# 🚀 Finora - Complete Setup Guide

## Quick Start (5 Minutes)

### Step 1: Start Backend Server

```bash
cd backend
npm start
```

Backend will run on: http://localhost:5000

### Step 2: Start Frontend

**Option A: Using Batch File (Windows)**
```bash
# Double-click START_FRONTEND.bat
# Or run from command line:
START_FRONTEND.bat
```

**Option B: Manual Start**
```bash
cd frontend
npm install
npm run dev
```

Frontend will open at: http://localhost:3000

---

## 🎯 Testing the Application

### 1. Register a New User

1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: password123
4. Click "Create Account"
5. You'll be automatically logged in and redirected to Dashboard

### 2. Explore Dashboard

You'll see:
- ✅ Portfolio Summary (Cash Balance, Invested, Value, P&L)
- ✅ Market Movers (Top Gainers, Losers, Most Active)
- ✅ Holdings Preview (if you have any)

### 3. Test Login/Logout

1. Click the Logout button (top right)
2. Login again with your credentials
3. Tokens are automatically managed

---

## 📋 Features Checklist

### ✅ Completed
- [x] Project setup with Vite + React
- [x] TailwindCSS styling with dark theme
- [x] Complete API service layer
- [x] JWT authentication with auto-refresh
- [x] Login & Register pages
- [x] Protected routes
- [x] Dashboard with portfolio summary
- [x] Market movers display
- [x] Holdings preview
- [x] Responsive navbar with mobile menu
- [x] Data refresh functionality
- [x] Beautiful UI with glassmorphism effects

### 🚧 To Be Implemented Next

#### Portfolio Page
- [ ] Full holdings table
- [ ] Buy/Sell order modals
- [ ] Position details
- [ ] Order history with filters
- [ ] Portfolio performance charts

#### Company Page
- [ ] Company search bar
- [ ] Company details display
- [ ] Financial charts (Revenue, EPS, etc.)
- [ ] Technical indicators (SMA, RSI)
- [ ] AI-generated analysis

#### Documents Page
- [ ] Drag-and-drop file upload
- [ ] Document list with categories
- [ ] Processing status indicator
- [ ] AI analysis results
- [ ] Financial metrics extraction
- [ ] Chart visualization

#### AI Chat Page
- [ ] Chat interface
- [ ] Message history
- [ ] Company context integration
- [ ] Portfolio-aware responses
- [ ] Chart generation
- [ ] Source citations display

#### Market Page
- [ ] Stock screener
- [ ] Market cap filters
- [ ] Search with multiple criteria
- [ ] Technical indicators dashboard

---

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Slate 900 background with blue accents
- **Glassmorphism**: Translucent cards with backdrop blur
- **Responsive**: Mobile, tablet, and desktop layouts
- **Animations**: Smooth transitions and fade-ins
- **Icons**: Lucide React for consistent iconography

### Color Scheme
```css
Primary: #0ea5e9 (Blue)
Background: #0f172a (Slate 900)
Cards: #1e293b (Slate 800)
Borders: #334155 (Slate 700)
Success: #10b981 (Green)
Error: #ef4444 (Red)
```

### Typography
- **Headings**: Bold, white text
- **Body**: Regular, gray-300
- **Labels**: Medium, gray-400

---

## 🔌 API Integration

All API calls are handled through dedicated service files:

```javascript
// Example: Get portfolio summary
import { portfolioService } from './services/portfolioService';

const data = await portfolioService.getSummary();
```

### Available Services

1. **authService** - Login, register, profile management
2. **portfolioService** - Holdings, orders, positions
3. **companyService** - Company data, analysis
4. **marketService** - Market data, indicators
5. **documentService** - File upload, analysis
6. **chatService** - AI chatbot interactions

---

## 🛠️ Development Workflow

### Adding a New Page

1. **Create Page Component**
   ```jsx
   // src/pages/MyPage.jsx
   import Navbar from '../components/Layout/Navbar';
   
   const MyPage = () => {
     return (
       <div className="min-h-screen bg-slate-900">
         <Navbar />
         <div className="max-w-7xl mx-auto px-4 py-8">
           {/* Your content */}
         </div>
       </div>
     );
   };
   
   export default MyPage;
   ```

2. **Add Route**
   ```jsx
   // src/App.jsx
   import MyPage from './pages/MyPage';
   
   <Route path="/mypage" element={
     <ProtectedRoute>
       <MyPage />
     </ProtectedRoute>
   } />
   ```

3. **Add to Navigation**
   ```jsx
   // src/components/Layout/Navbar.jsx
   const navigation = [
     // ... existing items
     { name: 'My Page', href: '/mypage', icon: YourIcon },
   ];
   ```

### Adding a New API Service

1. **Create Service File**
   ```javascript
   // src/services/myService.js
   import api from './api';
   
   export const myService = {
     getData: async () => {
       const response = await api.get('/api/my-endpoint');
       return response.data;
     },
   };
   ```

2. **Use in Component**
   ```jsx
   import { myService } from '../services/myService';
   
   const data = await myService.getData();
   ```

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Grid Layouts
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

---

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to backend
**Solution**: 
1. Check backend is running on port 5000
2. Verify `.env` has `VITE_API_URL=http://localhost:5000`

### Issue: Token expired
**Solution**: 
Tokens auto-refresh. If issues persist, logout and login again.

### Issue: CORS error
**Solution**: 
Backend must have CORS enabled for `http://localhost:3000`

### Issue: Build fails
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Next Development Priorities

Based on your backend APIs, here's the recommended order:

1. **Portfolio Page** (Most Important)
   - Users need to manage their holdings
   - Buy/Sell functionality is core feature

2. **Company Page**
   - View company details
   - AI analysis display
   - Charts for financials

3. **AI Chat**
   - Most unique feature
   - Multi-source intelligence
   - Chart generation

4. **Documents**
   - File upload
   - AI analysis
   - Financial insights

5. **Market**
   - Stock screener
   - Technical indicators

---

## 📚 Code Style Guidelines

### Component Structure
```jsx
// 1. Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Component
const MyComponent = () => {
  // 3. State
  const [data, setData] = useState(null);
  
  // 4. Hooks
  const navigate = useNavigate();
  
  // 5. Effects
  useEffect(() => {}, []);
  
  // 6. Handlers
  const handleClick = () => {};
  
  // 7. Render
  return <div>...</div>;
};

// 8. Export
export default MyComponent;
```

### Naming Conventions
- Components: PascalCase (`MyComponent`)
- Files: PascalCase (`MyComponent.jsx`)
- Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)

---

## 🎯 Performance Tips

1. **Lazy Loading**
   ```jsx
   const MyPage = lazy(() => import('./pages/MyPage'));
   ```

2. **Memoization**
   ```jsx
   const memoizedValue = useMemo(() => computeExpensive(data), [data]);
   ```

3. **Debouncing**
   ```jsx
   const debouncedSearch = debounce(search, 500);
   ```

---

## 📞 Support

If you need help:
1. Check the README files
2. Review API documentation
3. Check browser console for errors
4. Verify backend logs

---

**Built with ❤️ by Team Certified Losers** 🚀

**Happy Coding! 🎉**
