# 🌱 EduVault User Seeding Guide

## Quick Setup

To set up the database with test users for all three interfaces, run:

```bash
cd server
npm run setup
```

This will create institutions, courses, and test users for all roles.

## Manual Seeding Options

### Option 1: Complete Setup (Recommended)
```bash
cd server
npm run setup
```

### Option 2: Users Only (if institutions already exist)
```bash
cd server
npm run seed:users
```

### Option 3: Full Database Reset
```bash
cd server
npm run seed        # Seed institutions and courses
npm run seed:users  # Seed test users
```

## 🔐 Test User Credentials

After seeding, you can log in with these accounts:

### 👑 Super Admin (Executive Command Center)
- **Email**: `superadmin@eduvault.co.ke`
- **Password**: `admin123`
- **Access**: http://localhost:3002
- **Features**: Complete platform oversight, financial analytics, system health

### 🛡️ Mini Admin (Content Admin Hub)
- **Email**: `admin@eduvault.co.ke`
- **Password**: `miniadmin123`
- **Access**: http://localhost:3001
- **Features**: Content management, resource approval, basic reporting

### 🎓 Student (Student Portal)
- **Email**: `student@eduvault.co.ke`
- **Password**: `student123`
- **Access**: http://localhost:3000
- **Features**: Premium subscription active, full access to resources

## 📝 Additional Test Accounts

### Free Student Account
- **Email**: `john.doe@student.co.ke`
- **Password**: `student123`
- **Note**: No premium subscription (for testing free tier)

### Additional Mini Admin
- **Email**: `content.admin@eduvault.co.ke`
- **Password**: `miniadmin123`
- **Note**: Alternative admin account for testing

## 🚀 Testing Workflow

1. **Start the Server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start Each Frontend** (in separate terminals):
   ```bash
   # Student Frontend (Port 3000)
   cd student-frontend
   npm start

   # Admin Frontend (Port 3001)
   cd admin-frontend
   PORT=3001 npm start

   # Super Admin Frontend (Port 3002)
   cd super-admin-frontend
   PORT=3002 npm start
   ```

3. **Test Each Interface**:
   - **Student**: http://localhost:3000 - Test resource access, job board
   - **Admin**: http://localhost:3001 - Test content management, approvals
   - **Super Admin**: http://localhost:3002 - Test analytics, system oversight

## 🔍 User Details

### Super Admin: Sarah Johnson
- **Role**: `super_admin`
- **Phone**: `0700000001`
- **Permissions**: Full system access, financial data, user management
- **UI Theme**: Dark purple executive theme

### Mini Admin: Michael Ochieng
- **Role**: `mini_admin`
- **Phone**: `0700000002`
- **Permissions**: Content management, resource approval
- **UI Theme**: Green/teal professional theme

### Student: Grace Wanjiku
- **Role**: `student`
- **Institution**: KMTC
- **Year**: 2nd Year
- **Phone**: `0700000003`
- **Subscription**: Active premium (90 days)
- **UI Theme**: Blue student-friendly theme

## 🛠️ Database Structure

The seeding creates:
- **5 Users** (1 super admin, 2 mini admins, 2 students)
- **Multiple Institutions** (KMTC, UON, etc.)
- **Various Courses** (Clinical Medicine, Nursing, etc.)
- **Sample Jobs** (for testing job board)
- **Premium Subscriptions** (for testing payment features)

## 🔄 Re-seeding

To reset and re-seed users:
```bash
cd server
npm run seed:users
```

This will:
1. Delete all existing users
2. Create fresh test accounts
3. Display new login credentials

## 🐛 Troubleshooting

### "No institutions found" Error
Run the main seed first:
```bash
npm run seed
```

### Database Connection Issues
Check your `.env` file in the server directory:
```env
MONGODB_URI=mongodb+srv://your-connection-string
```

### Port Conflicts
Make sure each frontend runs on its designated port:
- Student: 3000
- Admin: 3001
- Super Admin: 3002

## 📊 Testing Scenarios

### Super Admin Testing
- [ ] Login to Executive Command Center
- [ ] View financial analytics
- [ ] Check system health metrics
- [ ] Manage all users
- [ ] Review platform statistics

### Mini Admin Testing
- [ ] Login to Content Admin Hub
- [ ] Upload new resources
- [ ] Approve/reject pending content
- [ ] Manage course materials
- [ ] View basic analytics

### Student Testing
- [ ] Login to Student Portal
- [ ] Browse institutions and courses
- [ ] Access premium resources (with premium account)
- [ ] Test free tier limitations (with free account)
- [ ] Unlock job postings
- [ ] Use AI chatbot

## 🎯 Next Steps

After seeding:
1. Test authentication across all interfaces
2. Verify role-based access control
3. Test premium vs free features
4. Validate UI themes and responsiveness
5. Test real-time features (if implemented)

---

**Need Help?** Check the main README.md or contact the development team.
