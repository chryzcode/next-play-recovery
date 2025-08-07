# Next Play Recovery

A comprehensive youth sports injury tracking platform designed for parents to monitor their children's sports injuries, track recovery progress, and access expert resources for safe return to play.

## Features

- **Injury Tracking**: Monitor recovery progress with a 3-phase system (Resting, Light Activity, Full Play)
- **Family Management**: Manage multiple children and injuries in one place
- **Photo Upload**: Secure photo upload with Cloudinary integration and privacy notices
- **Resource Center**: Expert articles, tips, and Q&As from sports medicine professionals
- **Progress Visualization**: Visual progress bars tied to recovery status
- **Export Options**: PDF and CSV export for injury history
- **Email Reminders**: Automated reminders for injury updates via Brevo
- **Account Verification**: Email verification system for new accounts
- **Password Reset**: Secure password reset functionality
- **Profile Management**: Update profile information and change passwords
- **Admin Panel**: Comprehensive admin dashboard for user and content management
- **Mobile-Friendly**: Responsive design that works on all devices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Email Service**: Brevo (formerly Sendinblue)
- **Image Storage**: Cloudinary
- **Icons**: Lucide React
- **UI Components**: Headless UI, Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Brevo account for email functionality
- Cloudinary account for image storage
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next-play-recovery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_SECRET=your-nextauth-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Email (Brevo)
   BREVO_API_KEY=your-brevo-api-key-here
   SENDER_EMAIL=your-verified-sender-email@domain.com
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Set up a MongoDB database (local or cloud)
   - Update the `MONGODB_URI` in your `.env.local` file
   - The application will automatically create the necessary collections

5. **Email Setup (Brevo)**
   - Create a Brevo account at https://www.brevo.com/
   - Get your API key from the Brevo dashboard
   - Verify your sender email address
   - Update the `BREVO_API_KEY` and `SENDER_EMAIL` in your `.env.local` file

6. **Image Storage Setup (Cloudinary)**
   - Create a Cloudinary account at https://cloudinary.com/
   - Get your cloud name, API key, and API secret
   - Update the Cloudinary credentials in your `.env.local` file

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
next-play-recovery/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin endpoints
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── children/      # Child management
│   │   │   ├── injuries/      # Injury management
│   │   │   └── user/          # User profile management
│   │   ├── admin/             # Admin pages
│   │   ├── children/          # Child-related pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── resources/         # Resource center
│   │   ├── profile/           # Profile management
│   │   ├── forgot-password/   # Password reset
│   │   ├── reset-password/    # Password reset confirmation
│   │   └── verify-email/      # Email verification
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── email.ts          # Email service (Brevo)
│   │   ├── cloudinary.ts     # Image upload service
│   │   └── mongodb.ts        # Database connection
│   └── models/               # Mongoose models
│       ├── User.ts           # User model
│       ├── Child.ts          # Child model
│       └── Injury.ts         # Injury model
├── public/                   # Static assets
└── package.json
```

## Key Features Implementation

### Authentication System
- JWT-based authentication with HTTP-only cookies
- Secure password hashing with bcryptjs
- Role-based access (admin/parent)
- Email verification for new accounts
- Password reset functionality

### Injury Tracking
- 3-phase recovery system: Resting (33%), Light Activity (66%), Full Play (100%)
- Progress visualization with color-coded status indicators
- Photo upload with Cloudinary integration and privacy notices
- Suggested recovery timelines based on injury type

### Email System (Brevo)
- Account verification emails
- Password reset emails
- Welcome emails
- Automated reminders for injury updates

### Image Management (Cloudinary)
- Secure image upload and storage
- Automatic image optimization
- Privacy-focused photo management
- Image deletion capabilities

### Resource Center
- 10 comprehensive topic areas with expert content
- Interactive Q&A sections
- Clean, card-based navigation

### Admin Panel
- Comprehensive dashboard with statistics
- User management (view, edit, create)
- Content management
- System settings
- Analytics and reporting

### Data Management
- MongoDB with Mongoose ODM
- Proper data relationships and population
- Secure API endpoints with authentication
- Role-based access control

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Update user password

### Children
- `GET /api/children` - Get user's children
- `POST /api/children` - Create new child

### Injuries
- `GET /api/injuries` - Get user's injuries
- `POST /api/injuries` - Create new injury
- `PUT /api/injuries/[id]` - Update injury
- `DELETE /api/injuries/[id]` - Delete injury

### Admin (Admin only)
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- Ensure MongoDB connection string is accessible
- Set up environment variables
- Build and deploy using `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@nextplayrecovery.com or create an issue in the repository.

## Roadmap

- [x] Email verification system
- [x] Password reset functionality
- [x] Profile management
- [x] Admin panel
- [x] Cloudinary integration
- [x] Brevo email integration
- [ ] Email reminder system implementation
- [ ] PDF/CSV export functionality
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Integration with healthcare providers
- [ ] Multi-language support
- [ ] Social features and community support
