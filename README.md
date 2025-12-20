# 📋 QR Attendance Management System

A modern, real-time attendance tracking system using rotating QR codes. Built for educational institutions to streamline attendance management with secure, fraud-resistant technology.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

## 🎯 Overview

This system allows teachers to create class sessions with dynamically rotating QR codes that students scan to mark their attendance. The rotating QR mechanism prevents screenshot sharing and ensures students are physically present in class.

## ✨ Features

### For Teachers/Administrators
- **Subject Management**: Create, edit, and delete subjects with CRN numbers and schedules
- **Session Control**: Start and stop attendance sessions with one click
- **Real-time Attendance**: View students marking attendance in real-time
- **Session History**: Access complete attendance records for all past sessions
- **QR Code Display**: Large, scannable QR codes optimized for projection

### For Students
- **Easy Check-in**: Scan QR code and fill simple form (name + CRN)
- **Instant Confirmation**: Immediate feedback on successful attendance submission
- **No App Required**: Works directly in mobile browser

### Security Features
- **Rotating QR Codes**: QR codes change every 17 seconds
- **Token Validation**: Each QR contains unique, time-sensitive tokens
- **Row Level Security**: Database-level protection ensures data isolation
- **Session-based Access**: QR codes only valid for active sessions

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework with Hooks |
| TypeScript | Type Safety |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Utility-first Styling |
| shadcn/ui | UI Component Library |
| React Router DOM | Client-side Routing |
| TanStack Query | Server State Management |
| react-hook-form | Form Handling |
| Zod | Schema Validation |

### Backend (Supabase)
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Relational Database |
| Supabase Auth | Authentication |
| Supabase Realtime | Live Updates |
| Row Level Security | Data Protection |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| qrcode | QR Code Generation |
| html5-qrcode | QR Code Scanning |
| date-fns | Date Formatting |
| lucide-react | Icon Library |
| sonner | Toast Notifications |

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AddSubjectDialog.tsx    # Modal for adding new subjects
│   │   ├── AttendanceList.tsx      # Real-time attendance display
│   │   ├── SessionHistoryDialog.tsx # Historical session data
│   │   └── SubjectList.tsx         # Subject cards with actions
│   ├── ui/                         # shadcn/ui components
│   ├── NavLink.tsx                 # Navigation component
│   ├── QRScanner.tsx               # QR code scanner
│   └── RegistrationForm.tsx        # User registration form
├── hooks/
│   ├── use-mobile.tsx              # Mobile detection hook
│   └── use-toast.ts                # Toast notification hook
├── integrations/
│   └── supabase/
│       ├── client.ts               # Supabase client instance
│       └── types.ts                # Auto-generated TypeScript types
├── lib/
│   └── utils.ts                    # Utility functions
├── pages/
│   ├── AdminDashboard.tsx          # Teacher dashboard
│   ├── AttendForm.tsx              # Student attendance form
│   ├── Auth.tsx                    # Login/Signup page
│   ├── Index.tsx                   # Landing page
│   ├── NotFound.tsx                # 404 page
│   └── SessionView.tsx             # Active session with QR
├── App.tsx                         # Main app with routing
├── App.css                         # Global styles
├── index.css                       # Tailwind directives
└── main.tsx                        # App entry point
```

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │   user_roles    │
├─────────────────┤       ├─────────────────┤
│ id (PK, FK)     │◄──────│ user_id (FK)    │
│ email           │       │ role            │
│ full_name       │       │ created_at      │
│ created_at      │       └─────────────────┘
└────────┬────────┘
         │
         │ teacher_id
         ▼
┌─────────────────┐
│    subjects     │
├─────────────────┤
│ id (PK)         │
│ teacher_id (FK) │
│ name            │
│ crn_number      │
│ day_time        │
│ created_at      │
└────────┬────────┘
         │
         │ subject_id
         ▼
┌─────────────────┐       ┌─────────────────┐
│    sessions     │       │   attendance    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ session_id (FK) │
│ subject_id (FK) │       │ id (PK)         │
│ teacher_id (FK) │       │ first_name      │
│ current_qr_token│       │ last_name       │
│ status          │       │ crn             │
│ qr_rotation_cnt │       │ qr_token        │
│ started_at      │       │ submitted_at    │
│ stopped_at      │       └─────────────────┘
└─────────────────┘
```

### Tables Description

| Table | Description |
|-------|-------------|
| `profiles` | User profile data (synced with auth.users) |
| `user_roles` | Role assignments (admin, teacher) |
| `subjects` | Course/class information |
| `sessions` | Active and historical attendance sessions |
| `attendance` | Individual attendance records |

## 🔐 Security Implementation

### Row Level Security (RLS) Policies

```sql
-- Teachers can only view their own subjects
CREATE POLICY "Teachers can view their own subjects"
ON subjects FOR SELECT
USING (auth.uid() = teacher_id);

-- Anyone can submit attendance (for QR scanning)
CREATE POLICY "Anyone can submit attendance"
ON attendance FOR INSERT
WITH CHECK (true);

-- Teachers can only view attendance for their sessions
CREATE POLICY "Teachers can view attendance for their sessions"
ON attendance FOR SELECT
USING (EXISTS (
  SELECT 1 FROM sessions
  WHERE sessions.id = attendance.session_id
  AND sessions.teacher_id = auth.uid()
));
```

### QR Code Security Flow

```
1. Teacher starts session
   └── Generate random token (32 hex chars)
   
2. Every 17 seconds:
   └── Generate new token
   └── Update session in database
   └── Regenerate QR code
   
3. Student scans QR:
   └── Extract session_id + token
   └── Validate token matches current session token
   └── If valid: record attendance with token
   └── If invalid: reject submission
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qr-attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   
   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Create profiles table
   CREATE TABLE public.profiles (
     id UUID NOT NULL PRIMARY KEY,
     email TEXT NOT NULL,
     full_name TEXT,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );

   -- Create user_roles table
   CREATE TYPE app_role AS ENUM ('admin', 'teacher');
   
   CREATE TABLE public.user_roles (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES public.profiles(id),
     role app_role NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );

   -- Create subjects table
   CREATE TABLE public.subjects (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     teacher_id UUID NOT NULL REFERENCES public.profiles(id),
     name TEXT NOT NULL,
     crn_number TEXT NOT NULL,
     day_time TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );

   -- Create sessions table
   CREATE TABLE public.sessions (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     subject_id UUID NOT NULL REFERENCES public.subjects(id),
     teacher_id UUID NOT NULL REFERENCES public.profiles(id),
     current_qr_token TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'active',
     qr_rotation_count INTEGER NOT NULL DEFAULT 0,
     started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     stopped_at TIMESTAMP WITH TIME ZONE
   );

   -- Create attendance table
   CREATE TABLE public.attendance (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     session_id UUID NOT NULL REFERENCES public.sessions(id),
     first_name TEXT NOT NULL,
     last_name TEXT NOT NULL,
     crn TEXT NOT NULL,
     qr_token TEXT NOT NULL,
     submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );

   -- Enable RLS on all tables
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

   -- Create function to handle new user signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER
   LANGUAGE plpgsql
   SECURITY DEFINER SET search_path = public
   AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, full_name)
     VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
     RETURN new;
   END;
   $$;

   -- Create trigger for new user signup
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 Usage Guide

### Teacher Workflow

1. **Sign Up/Login**
   - Navigate to `/auth`
   - Create account or login with existing credentials

2. **Add Subjects**
   - Click "Add Subject" on dashboard
   - Enter subject name, CRN, and schedule

3. **Start Session**
   - Click "Start Session" on any subject card
   - QR code appears and starts rotating

4. **Monitor Attendance**
   - Watch real-time attendance list
   - Click "Stop Session" when done

5. **View History**
   - Click "History" on subject card
   - View all past sessions and attendance records

### Student Workflow

1. **Scan QR Code**
   - Open camera or QR scanner app
   - Scan the displayed QR code

2. **Fill Form**
   - Enter first name, last name, and CRN
   - Submit attendance

3. **Confirmation**
   - Receive instant confirmation
   - Attendance recorded in system

## 🔧 Configuration

### QR Rotation Interval

Modify the rotation interval in `src/pages/SessionView.tsx`:

```typescript
const QR_ROTATION_INTERVAL = 17000; // milliseconds (17 seconds)
```

### Supabase Auth Settings

For development, enable auto-confirm email in Supabase:
- Go to Authentication → Settings
- Disable "Enable email confirmations"

## 📄 API Reference

### Supabase Tables

#### Subjects
```typescript
interface Subject {
  id: string;
  teacher_id: string;
  name: string;
  crn_number: string;
  day_time: string;
  created_at: string;
}
```

#### Sessions
```typescript
interface Session {
  id: string;
  subject_id: string;
  teacher_id: string;
  current_qr_token: string;
  status: 'active' | 'stopped';
  qr_rotation_count: number;
  started_at: string;
  stopped_at: string | null;
}
```

#### Attendance
```typescript
interface Attendance {
  id: string;
  session_id: string;
  first_name: string;
  last_name: string;
  crn: string;
  qr_token: string;
  submitted_at: string;
}
```

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## 📦 Deployment

### Using Cloudflare
1. run the project (npm run dev)
2. you will see http://localhost:0000 (port that you are using, f.e. 5173)
3. in other terminal run the command: cloudflared tunnel --url http://localhost:0000 (your port)

### Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to any static hosting:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Supabase](https://supabase.com/) - Backend infrastructure

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---