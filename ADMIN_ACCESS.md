# Admin Access Configuration

## Admin Login Credentials

The admin panel is now protected by login authentication instead of direct URL access.

### Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

### How to Access Admin Panel

1. Navigate to the login page: `http://localhost:8080/login`
2. Enter the admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign In"
4. You will be redirected to the admin dashboard: `http://localhost:8080/admin`

### Security Features

- Admin credentials are hardcoded in the backend logic (not stored in database)
- Direct URL access to `/admin` is now blocked - users must login first
- Authentication is verified on both frontend and backend
- Admin sessions are managed through the same auth store as other users

### Technical Implementation

- Admin authentication is handled in `backend/controllers/authController.js`
- Frontend routing protection is implemented in `frontend/src/App.tsx`
- Admin credentials are checked before database lookup for performance
- Special admin ID (999) is used to distinguish from regular users

### Development Notes

- Admin credentials are currently hardcoded for simplicity
- No password hashing is applied to admin credentials (since they're not stored)
- Admin role has full access to all admin panel features
- Authentication state persists across browser refreshes

---

**Important:** These credentials should be changed in production environments and proper security measures should be implemented.
