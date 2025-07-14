# Course Addition Debugging Guide

## Steps to Debug the Course Addition Issue

### 1. Check Database Table Existence
First, verify if the courses table exists in your database:

```bash
# Navigate to backend directory
cd backend

# Run the database test script
node test_courses.js
```

If the courses table doesn't exist, you need to run the SQL migration:

```sql
-- Import the course management schema
mysql -u [your_username] -p [your_database_name] < database/course_management_updates.sql
```

### 2. Check Browser Console for Errors
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try adding a course
4. Look for error messages starting with:
   - 🔄 (course data being sent)
   - 📡 (response status)
   - ✅ (success) or ❌ (errors)

### 3. Check Network Tab
1. Open Developer Tools → Network tab
2. Try adding a course
3. Look for the POST request to `/api/admin/courses`
4. Check:
   - Request status (should be 200 or 201)
   - Request payload (course data)
   - Response data

### 4. Check Backend Logs
Look at your backend terminal for any error messages when the request is made.

### 5. Common Issues and Solutions

#### Issue 1: Database Table Missing
**Symptoms**: 500 error, "Table 'courses' doesn't exist"
**Solution**: Run the migration script

#### Issue 2: API Route Not Found
**Symptoms**: 404 error on POST to `/api/admin/courses`
**Solution**: Check if server started properly without errors

#### Issue 3: Form Validation Failing
**Symptoms**: Red toast with "Validation Error"
**Solution**: Ensure course code and course name are filled

#### Issue 4: Database Connection Issues
**Symptoms**: 500 error, database connection errors in backend
**Solution**: Check database credentials in config/db.js

#### Issue 5: CORS Issues
**Symptoms**: Network errors, CORS policy errors
**Solution**: Ensure backend CORS is configured for frontend origin

### 6. Manual API Test
You can test the API directly using curl:

```bash
curl -X POST http://localhost:5000/api/admin/courses \
  -H "Content-Type: application/json" \
  -d '{
    "course_code": "TEST101",
    "course_name": "Test Course",
    "description": "A test course",
    "credits": 3,
    "difficulty_level": "Easy"
  }'
```

### 7. Expected Behavior
When everything works correctly, you should see:
1. Console log: "🔄 Adding course with data: {course_code: '...', ...}"
2. Console log: "📡 Response status: 201"
3. Console log: "✅ Course added successfully: {message: '...', courseId: X}"
4. Green toast: "Course added successfully"
5. The new course appears in the courses list
6. The add course dialog closes

### 8. If Still Not Working
1. Restart the backend server
2. Hard refresh the frontend (Ctrl+Shift+R)
3. Check if any other browser extensions are blocking requests
4. Try in an incognito/private window
