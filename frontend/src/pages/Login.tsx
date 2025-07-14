import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';

// TypeScript interfaces
interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  role?: 'student' | 'lecturer' | 'admin';
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
  };
}

const Login: React.FC = () => {
  // Your original state structure
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  // Your original handleSubmit logic (unchanged)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // Send the login request to the backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data: LoginResponse = await response.json();
      
      if (response.ok && data.success) {
        // Store username in localStorage for all roles
        localStorage.setItem("username", username);
        
        // If login is successful and user role is returned
        if (data.role === "student") {
          // Create user object for auth store
          const user = {
            id: '1', // You may want to get this from the backend response
            name: data.fullName || username, // Use full name from backend
            email: `${username}@university.edu`,
            role: data.role as const
          };
          
          setUser(user);
          toast({ 
            title: "Login successful", 
            description: `Welcome back, ${user.name}!` 
          });
          
          // Redirect to the student dashboard
          navigate("/student");
        } else if (data.role === "lecturer") {
          // Create user object for auth store
          const user = {
            id: '1', // You may want to get this from the backend response
            name: data.fullName || username, // Use full name from backend
            email: `${username}@university.edu`,
            role: data.role as const
          };
          
          setUser(user);
          toast({ 
            title: "Login successful", 
            description: `Welcome back, ${user.name}!` 
          });
          
          // Redirect to the lecturer dashboard
          navigate("/lecturer");
        } else if (data.role === "admin") {
          // Handle admin login if needed
          const user = {
            id: '1',
            name: data.fullName || username,
            email: `${username}@university.edu`,
            role: data.role as const
          };
          
          setUser(user);
          toast({ 
            title: "Login successful", 
            description: `Welcome back, ${user.name}!` 
          });
          
          navigate("/admin");
        }
      } else {
        // If login fails, set the error message
        setError(data.message || "Login failed. Please try again.");
        toast({
          title: "Login failed",
          description: data.message || "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      // Handle any unexpected errors
      const errorMessage = "Something went wrong. Please try again.";
      setError(errorMessage);
      toast({
        title: "Connection error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-blue-400">EduTrack</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">Sign in to your account</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error message display */}
            {error && (
              <div className="p-3 rounded-md bg-red-900/20 border border-red-700">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-200">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <p className="text-sm text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-400 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;