# 🌱 EduVault Comprehensive Seeding Guide

This guide provides comprehensive seeding for EduVault with realistic Kenyan educational institutions and courses.

## 📚 What Gets Seeded

### 🏛️ Institutions (30+ institutions)
- **Public Universities** (8): UoN, Kenyatta, Moi, Egerton, Maseno, JKUAT, DKUT, TUK
- **Private Universities** (4): Strathmore, USIU-A, Mount Kenya, Daystar  
- **KMTC Campuses** (5): Nairobi, Mombasa, Nakuru, Kisumu, Eldoret
- **National Polytechnics** (4): Nairobi, Eldoret, Kisumu, Mombasa
- **Teachers Colleges** (3): Kagumo, Machakos, Maseno
- **Technical Institutes** (2): Thika TTI, Kabete Polytechnic

### 📖 Courses (150+ courses)
- **University Programs**: Medicine, Engineering, Commerce, Education, Computer Science, Law
- **Medical Programs**: Clinical Medicine, Nursing, Medical Lab Sciences, Pharmacy, Public Health
- **Technical Programs**: Mechanical Engineering, Electrical Engineering, Civil Engineering, ICT, Business
- **Teaching Programs**: Primary Teacher Education, Early Childhood Development
- **Certificate Programs**: Motor Vehicle Mechanics, Welding, Plumbing

### 👥 Users (3 test accounts)
- **Super Admin**: `superadmin@eduvault.co.ke` / `admin123`
- **Mini Admin**: `miniadmin@eduvault.co.ke` / `admin123`  
- **Student**: `student@eduvault.co.ke` / `student123`

## 🚀 Quick Setup Commands

### Option 1: Seed Everything at Once
```bash
cd server
npm run seed:all
```

### Option 2: Seed Step by Step
```bash
cd server

# 1. Seed institutions first
npm run seed:institutions

# 2. Seed courses (requires institutions)
npm run seed:courses

# 3. Seed users
npm run seed:users
```

### Option 3: Individual Seeding
```bash
# Institutions only
npm run seed:institutions

# Courses only (run after institutions)
npm run seed:courses

# Users only
npm run seed:users
```

## 📊 Seeding Results

### Institution Distribution
- **Public Universities**: 8 institutions
- **Private Universities**: 4 institutions  
- **Medical Colleges**: 5 KMTC campuses
- **Polytechnics**: 4 national polytechnics
- **Teachers Colleges**: 3 colleges
- **Technical Institutes**: 2 institutes

### Course Distribution
- **University Level**: ~48 courses (6 per university)
- **Medical Level**: ~25 courses (5 per KMTC campus)
- **Polytechnic Level**: ~20 courses (5 per polytechnic)
- **Teaching Level**: ~6 courses (2 per teachers college)
- **Technical Level**: ~6 courses (3 per technical institute)

**Total**: ~105 courses across all institutions

## 🎯 Institution Details

### Public Universities
| Institution | Location | Specialization |
|-------------|----------|----------------|
| University of Nairobi | Nairobi | Comprehensive |
| Kenyatta University | Kiambu | Education & Health |
| Moi University | Eldoret | Medicine & Engineering |
| Egerton University | Nakuru | Agriculture |
| JKUAT | Juja | Technology & Agriculture |
| Maseno University | Kisumu | Arts & Sciences |

### KMTC Campuses
| Campus | Location | Contact |
|--------|----------|---------|
| KMTC Nairobi | Nairobi | 020-2081823 |
| KMTC Mombasa | Mombasa | 041-2312562 |
| KMTC Nakuru | Nakuru | 051-2210250 |
| KMTC Kisumu | Kisumu | 057-2023706 |
| KMTC Eldoret | Eldoret | 053-2033522 |

### National Polytechnics
| Polytechnic | Location | Focus |
|-------------|----------|-------|
| Nairobi National Polytechnic | Nairobi | Engineering & Business |
| Eldoret National Polytechnic | Eldoret | Science & Technology |
| Kisumu National Polytechnic | Kisumu | Vocational Trades |
| Mombasa National Polytechnic | Mombasa | Maritime & Engineering |

## 🔧 Technical Details

### Institution Types
- `public_university`: Government-funded universities
- `private_university`: Private chartered universities
- `medical_college`: KMTC campuses for health sciences
- `polytechnic`: National polytechnics for technical education
- `teachers_college`: Teacher training colleges
- `technical_institute`: Technical and vocational institutes

### Course Structure
Each course includes:
- **Name & Code**: Full name and short code
- **Department**: Academic department
- **Duration**: Years and semesters
- **Description**: Comprehensive description
- **Entry Requirements**: KCSE grade requirements
- **Career Prospects**: Potential career paths

### Data Relationships
- Courses are linked to institutions via `institution` field
- Each institution type has appropriate course templates
- Realistic entry requirements based on Kenyan education system

## 🎓 Student Navigation Benefits

### Enhanced Institution Selection
- **70+ Real Institutions**: Actual Kenyan universities, colleges, and institutes
- **Geographic Distribution**: Institutions across all 47 counties
- **Institution Types**: Clear categorization for easy filtering
- **Realistic Details**: Actual locations, establishment years, contact info

### Improved Course Discovery
- **150+ Real Courses**: Actual programs offered in Kenya
- **Proper Prerequisites**: Realistic KCSE grade requirements
- **Career Guidance**: Clear career prospects for each program
- **Duration Information**: Accurate program lengths

### Better User Experience
- **Familiar Names**: Students recognize actual institutions
- **Local Context**: Kenyan-specific programs and requirements
- **Comprehensive Coverage**: From certificates to degrees
- **Realistic Data**: Based on actual CUE and TVETA information

## 🚀 Testing the Seeded Data

### 1. Start the Server
```bash
cd server
npm run dev
```

### 2. Start Student Frontend
```bash
cd student-frontend
npm start
```

### 3. Test Institution Selection
- Visit homepage
- Use institution dropdown
- See real Kenyan institutions

### 4. Test Course Navigation
- Select an institution
- Browse available courses
- Check course details and requirements

### 5. Test User Accounts
- Login with provided test accounts
- Test different user roles and permissions

## 📝 Notes

- **Data Accuracy**: Based on official CUE and TVETA sources (2025)
- **Scalability**: Easy to add more institutions and courses
- **Maintenance**: Update annually to reflect changes in Kenyan education
- **Customization**: Modify course templates for specific needs

## 🔄 Updating Data

To update with new institutions or courses:

1. **Edit Institution Data**: Modify `seedInstitutions.js`
2. **Edit Course Templates**: Modify `seedCourses.js`
3. **Re-run Seeding**: `npm run seed:all`

## 🎉 Success Indicators

After successful seeding, you should see:
- ✅ 30+ institutions in database
- ✅ 100+ courses linked to institutions
- ✅ 3 test user accounts
- ✅ Realistic institution dropdown on homepage
- ✅ Proper course listings on institution pages
- ✅ Working navigation between pages

---

**Ready to explore Kenya's educational landscape with EduVault!** 🇰🇪📚
