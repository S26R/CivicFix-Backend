# CivicFix Backend 🏙️

A Node.js/Express backend API for the CivicFix civic issue reporting and management system. This server handles citizen issue submissions, authority management, department assignments, and provides analytics and feeds for municipal governance.

## 🚀 Features

### For Citizens
- **Issue Submission**: Create issues with media uploads, location tracking, and department categorization
- **Issue Management**: View, update, and delete personal issues
- **Upvoting System**: Support important civic issues in the community
- **Location-based Feeds**: Get nearby issues based on geographical proximity and relevance
- **Profile Management**: Manage personal account information

### For Authorities/Admin
- **Comprehensive Analytics**: View detailed statistics and insights across all issues
- **Issue Assignment**: Assign issues to appropriate departments
- **Status Management**: Update issue statuses and track resolution progress
- **User Management**: Oversee citizen and department accounts
- **Department Oversight**: Monitor department performance and workload

### For Departments
- **Assignment Dashboard**: View issues assigned by authorities
- **Status Updates**: Update issue progress and resolution status
- **Workload Management**: Track assigned issues and department metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary for media uploads
- **Security**: bcryptjs for password hashing, CORS for cross-origin requests
- **Middleware**: Multer for file handling, express-rate-limit for API protection
- **Background Tasks**: Cron jobs for periodic maintenance
- **Environment**: dotenv for configuration management

## 📁 Project Structure

```
CivicFix-Backend/
├── src/
│   ├── server.js                     # Application entry point
│   ├── env.js                        # Environment configuration
│   ├── seedUsers.js                  # Database seeding for users
│   ├── seedIssue.js                  # Database seeding for issues
│   ├── config/
│   │   └── db.js                     # MongoDB connection configuration
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication logic
│   │   ├── issue.controller.js       # Issue management
│   │   ├── authority.dashboard.controller.js  # Authority operations
│   │   ├── department.controller.js   # Department operations
│   │   └── citizen.dashboard.controller.js    # Citizen dashboard
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT authentication & authorization
│   │   └── multer.middleware.js      # File upload handling
│   ├── models/
│   │   ├── user.model.js            # User schema (citizens, authorities, departments)
│   │   └── issue.model.js           # Issue schema with geolocation
│   ├── routes/
│   │   ├── auth.routes.js           # Authentication endpoints
│   │   ├── issue.routes.js          # Issue management endpoints
│   │   ├── authority.routes.js      # Authority-specific endpoints
│   │   ├── department.routes.js     # Department-specific endpoints
│   │   └── dashboard.routes.js      # Dashboard endpoints
│   └── utils/
│       ├── cloudinary.js           # Media upload utilities
│       ├── cron.js                 # Background job scheduler
│       ├── ApiError.js             # Error handling utilities
│       └── ApiResponse.js          # Response formatting utilities
├── public/
│   └── temp/                       # Temporary file storage
├── package.json                    # Dependencies and scripts
├── .env                           # Environment variables (not committed)
├── .gitignore                     # Git ignore rules
└── LICENSE                        # Apache 2.0 License
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Cloudinary account for media storage
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/S26R/CivicFix-Backend.git
   cd CivicFix-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/civicfix
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/civicfix

   # Authentication
   JWT_SECRET=your_jwt_secret_key_here

   # Server Configuration
   PORT=5000

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Optional: For cron job health checks
   API_URL=http://localhost:5000
   ```

4. **Seed the database (optional)**
   ```bash
   # Seed test users (authority and department)
   node src/seedUsers.js
   
   # Seed sample issues
   node src/seedIssue.js
   ```

5. **Start the development server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will be running at `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Citizen registration
- `POST /api/auth/login` - Citizen login
- `POST /api/auth/login/authority` - Authority login
- `POST /api/auth/login/department` - Department login
- `GET /api/auth/profile/:id` - Get user profile
- `POST /api/auth/logout` - User logout

### Issues
- `POST /api/issues/create` - Create new issue (with media upload)
- `GET /api/issues/allissues` - Get all issues
- `GET /api/issues/:id` - Get specific issue
- `GET /api/issues/user/:id` - Get user's issues
- `GET /api/issues/nearby` - Get nearby issues
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/upvote` - Upvote issue
- `DELETE /api/issues/:id/upvote` - Remove upvote

### Feeds
- `GET /api/issues/feed/citizen` - Intelligent citizen feed
- `GET /api/issues/feed/authority` - Authority dashboard feed
- `GET /api/issues/feed/department` - Department dashboard feed

### Authority Operations
- `GET /api/authority/dashboard/analytics` - Comprehensive analytics
- `GET /api/authority/allIssues` - All issues for authority
- `GET /api/authority/allUsers` - All users management
- `PUT /api/authority/issue/:id/updateStatus` - Update issue status
- `PUT /api/authority/issues/:id/assignIssue` - Assign issue to department

### Department Operations
- `GET /api/department/issues` - Get assigned issues
- `PUT /api/department/issues/:id/status` - Update issue status

### Dashboard
- `GET /api/dashboard/citizen` - Citizen dashboard
- `GET /api/dashboard/authority` - Authority dashboard
- `GET /api/dashboard/department` - Department dashboard

## 🔐 Authentication & Authorization

The API implements role-based access control (RBAC) with three user types:

### User Roles
- **Citizen**: Can create, view, and upvote issues
- **Authority**: Can view analytics, assign issues, and manage users
- **Department**: Can view assigned issues and update status

### Authentication Flow
1. Users authenticate with role-specific endpoints
2. JWT tokens are issued with role information
3. Protected routes verify tokens and check role permissions
4. Different endpoints are accessible based on user roles

### Authorization Middleware
```javascript
// Authenticate user
authenticateUser(req, res, next)

// Authorize specific roles
authorizeRoles("citizen", "authority", "department")
```

## 📊 Analytics & Insights

### Authority Analytics Dashboard
- **Issue Statistics**: Count by status, department, severity
- **Trend Analysis**: Issues over time (monthly tracking)
- **Performance Metrics**: Average resolution time
- **User Insights**: Top reporters and most upvoted issues
- **Geographical Data**: Issue hotspots and location clustering

### Feed Algorithm
The citizen feed uses a sophisticated scoring algorithm considering:
- **Proximity Factor**: Distance from user location
- **Upvote Factor**: Community engagement level
- **Recency Factor**: How recently the issue was reported
- **Severity Factor**: Critical issues get higher priority

Scoring adapts to context (rural/semi-urban/urban) with different weight distributions.

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique),
  phone: String (unique),
  aadhaar: String (unique),
  password: String (hashed),
  wardNumber: String,
  villageArea: String,
  location: String,
  role: ["citizen", "department", "authority"],
  assignedIssues: [Issue References],
  delegatedIssues: [Issue References]
}
```

### Issue Model
```javascript
{
  topic: String,
  description: String,
  department: String (enum),
  assignedDepartment: User Reference,
  assignedByAuthority: User Reference,
  media: [{ type, url, publicId }],
  location: { type: "Point", coordinates: [lng, lat] },
  upvotes: [User References],
  severity: ["critical", "moderate", "minor"],
  status: ["verifying", "raised", "in-progress", "resolved", "rejected", "assigned"],
  uploadedBy: User Reference,
  participants: [User References],
  statusHistory: [Status Changes],
  assignmentHistory: [Assignment Records]
}
```

## 🔧 Development Scripts

```json
{
  "dev": "node --watch src/server.js",
  "start": "node src/server.js"
}
```

## 📦 Key Dependencies

- `express`: ^5.1.0 - Web framework
- `mongoose`: ^8.18.0 - MongoDB ODM
- `jsonwebtoken`: ^9.0.2 - JWT authentication
- `bcryptjs`: ^3.0.2 - Password hashing
- `cloudinary`: ^1.41.3 - Media storage
- `multer`: ^2.0.2 - File upload handling
- `cors`: ^2.8.5 - Cross-origin resource sharing
- `express-rate-limit`: ^8.1.0 - API rate limiting
- `cron`: ^4.3.3 - Background job scheduling
- `dotenv`: ^17.2.2 - Environment configuration

## 🌐 Deployment

### Environment Setup
1. Set up MongoDB database (local or cloud)
2. Configure Cloudinary for media storage
3. Set all required environment variables
4. Ensure proper network security and CORS configuration

### Production Considerations
- Use environment-specific MongoDB URIs
- Implement proper logging and monitoring
- Set up SSL/TLS for HTTPS
- Configure reverse proxy (nginx) if needed
- Set up automatic backups for database
- Monitor API performance and rate limits

## 🧪 Seeding & Testing

### Database Seeding
```bash
# Create test authority and department users
node src/seedUsers.js

# Create sample issues for testing
node src/seedIssue.js
```

### Test Users
After seeding, you can use these test accounts:
- **Department**: Phone: `9000000000`, Password: `electricity123`
- **Authority**: Phone: `9000000001`, Password: `commissioner123`

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure token generation and validation
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Mongoose schema validation
- **CORS Configuration**: Controlled cross-origin access
- **Role-based Access**: Granular permission system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Dev Vikings** - Developed as part of a civic engagement initiative to improve municipal service delivery and citizen participation.

## 🐛 Known Issues & Troubleshooting

### Common Issues
- **Database Connection**: Ensure MongoDB is running and connection string is correct
- **Cloudinary Setup**: Verify all Cloudinary credentials are properly configured
- **JWT Errors**: Check JWT_SECRET is set and tokens haven't expired
- **File Upload Issues**: Ensure Cloudinary configuration is correct
- **Geolocation Queries**: Make sure MongoDB has 2dsphere index on location field

### Performance Optimization
- Use MongoDB indexes for frequently queried fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Optimize Cloudinary image delivery

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**CivicFix Backend** - Powering civic engagement through robust API infrastructure. 🌟
