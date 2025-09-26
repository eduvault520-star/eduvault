# EduVault - Restructured Architecture

## Overview
EduVault has been restructured into separate, focused applications for better maintainability, deployment flexibility, and role-based access control.

## New Project Structure

```
EduVault/
├── student-frontend/          # Student-facing React application
├── admin-frontend/           # Mini Admin dashboard React application
├── super-admin-frontend/     # Super Admin dashboard React application
├── server/                   # Backend API server (Node.js/Express)
├── frontend/                 # Original frontend (kept for reference)
├── backend/                  # Original backend (kept for reference)
└── [other files...]
```

## Applications

### 1. Student Frontend (`student-frontend/`)
**Purpose**: Main student-facing application
**Port**: 3000 (default)
**Features**:
- Institution browsing and selection
- Course exploration with year/unit navigation
- Resource access (lectures, past papers, CATs)
- Job board with unlock payments
- AI chatbot integration
- User profile management
- Payment integration (M-Pesa)

**Key Routes**:
- `/` - Home page with institution selection
- `/login` - Student authentication
- `/register` - Student registration
- `/institution/:id` - Institution details
- `/course/:id` - Course content
- `/resources` - Resource library
- `/jobs` - Job board
- `/profile` - User profile

**To Run**:
```bash
cd student-frontend
npm install
npm start
```

### 2. Admin Frontend (`admin-frontend/`)
**Purpose**: Mini Admin dashboard for content management
**Port**: 3001 (recommended)
**Features**:
- Content upload and management
- Course and resource moderation
- Basic reporting and analytics
- User management (limited scope)

**Key Routes**:
- `/` - Redirects to `/admin`
- `/login` - Admin authentication
- `/admin` - Main admin dashboard

**To Run**:
```bash
cd admin-frontend
npm install
PORT=3001 npm start
```

### 3. Super Admin Frontend (`super-admin-frontend/`)
**Purpose**: Super Admin dashboard for full system oversight
**Port**: 3002 (recommended)
**Features**:
- Complete system oversight
- Financial tracking and reporting
- Audit logs and system monitoring
- User role management
- Institution and admin management

**Key Routes**:
- `/` - Redirects to `/super-admin`
- `/login` - Super admin authentication
- `/super-admin` - Main super admin dashboard

**To Run**:
```bash
cd super-admin-frontend
npm install
PORT=3002 npm start
```

### 4. Server (`server/`)
**Purpose**: Backend API server
**Port**: 5000 (default)
**Features**:
- RESTful API endpoints
- JWT authentication with role-based access
- MongoDB database integration
- Payment processing (M-Pesa)
- File upload handling
- Socket.io for real-time features

**Key API Routes**:
- `/api/auth/*` - Authentication endpoints
- `/api/institutions/*` - Institution management
- `/api/courses/*` - Course management
- `/api/resources/*` - Resource management
- `/api/payments/*` - Payment processing
- `/api/jobs/*` - Job board management
- `/api/admin/*` - Admin operations
- `/api/chatbot/*` - AI chatbot integration

**To Run**:
```bash
cd server
npm install
npm run dev
```

## Development Workflow

### Running All Applications
You can run all applications simultaneously for full-stack development:

1. **Terminal 1 - Server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 - Student Frontend**:
   ```bash
   cd student-frontend
   npm start
   ```

3. **Terminal 3 - Admin Frontend**:
   ```bash
   cd admin-frontend
   PORT=3001 npm start
   ```

4. **Terminal 4 - Super Admin Frontend**:
   ```bash
   cd super-admin-frontend
   PORT=3002 npm start
   ```

### Access URLs
- **Students**: http://localhost:3000
- **Mini Admins**: http://localhost:3001
- **Super Admins**: http://localhost:3002
- **API Server**: http://localhost:5000

## Benefits of This Structure

### 1. **Separation of Concerns**
- Each frontend is tailored to its specific user role
- Reduced bundle sizes and faster load times
- Cleaner, more focused codebases

### 2. **Security**
- Role-specific applications reduce attack surface
- Admin functionalities are completely separated from student access
- Easier to implement role-based security policies

### 3. **Scalability**
- Independent deployment of each application
- Can scale different parts based on usage patterns
- Easier to implement different caching strategies

### 4. **Maintainability**
- Smaller, focused codebases are easier to maintain
- Team members can work on specific applications without conflicts
- Easier to implement application-specific optimizations

### 5. **Deployment Flexibility**
- Deploy applications on different servers/domains
- Independent CI/CD pipelines
- Different hosting strategies for different user types

## Configuration Notes

### Environment Variables
Each application should have its own environment configuration:

**Student Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Admin Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Super Admin Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Server** (`.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduvault
JWT_SECRET=your_jwt_secret
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
```

### Proxy Configuration
Each frontend has proxy configuration in `package.json` pointing to the server:
```json
"proxy": "http://localhost:5000"
```

## Migration Notes

### From Original Structure
- Original `frontend/` and `backend/` directories are preserved for reference
- All functionality has been distributed across the new applications
- Database models and API endpoints remain unchanged
- Authentication and authorization logic is preserved

### Shared Components
Common components (contexts, utilities, etc.) are duplicated across frontends. Consider creating a shared component library for future optimization.

## Next Steps

1. **Testing**: Update test suites for each separated application
2. **Documentation**: Create specific documentation for each application
3. **CI/CD**: Set up separate deployment pipelines
4. **Shared Library**: Consider extracting common components into a shared package
5. **Docker**: Create separate Docker configurations for each application

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure each application runs on a different port
2. **API Connectivity**: Verify proxy settings and server URL configurations
3. **Authentication**: Ensure JWT tokens are properly shared across applications
4. **CORS**: Configure CORS settings in the server for multiple frontend origins

### Support
For issues specific to each application, check the respective application's logs and ensure all dependencies are properly installed.
