# Node.js User Management Backend

This project is a Node.js application that provides user management functionalities, including user signup, admin approval, and user authentication. It uses MySQL as the database and is designed to handle pending and approved user requests.

## Features

- User signup with full name, university email, role selection, and ID photo upload.
- Admin review of pending user requests with options to approve or reject.
- Automatic generation of usernames and passwords upon approval.
- Email notifications to users with their generated credentials.
- Secure authentication and authorization for users and admins.

## Project Structure

```
nodejs-user-management-backend
├── src
│   ├── app.js
│   ├── config
│   │   └── database.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models
│   │   ├── PendingUser.js
│   │   └── ApprovedUser.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── utils
│   │   ├── emailService.js
│   │   ├── passwordGenerator.js
│   │   └── usernameGenerator.js
│   └── uploads
├── package.json
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd nodejs-user-management-backend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up the MySQL database:**
   - Ensure XAMPP is running and MySQL is enabled.
   - Create two tables: `PendingUsers` and `ApprovedUsers` with the appropriate schema.

4. **Configure database connection:**
   - Update the database configuration in `src/config/database.js` with your MySQL credentials.

5. **Run the application:**
   ```
   npm start
   ```

## Usage

- **User Signup:** Users can sign up by providing their full name, university email, selecting a role, and uploading an ID photo.
- **Admin Approval:** Admins can review pending user requests and approve or reject them.
- **Login:** Approved users can log in using the username and password sent to their email.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.