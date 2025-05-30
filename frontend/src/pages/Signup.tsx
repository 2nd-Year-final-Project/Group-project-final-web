
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    idPhoto: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    // Mock signup process
    setTimeout(() => {
      toast({ 
        title: "Account created successfully", 
        description: "Please wait for admin verification before signing in." 
      });
      navigate('/login');
      setIsLoading(false);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, idPhoto: e.target.files![0] }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
  <Card className="w-full max-w-md bg-white border-gray-300 shadow-lg">
    <CardHeader className="text-center">
      <CardTitle className="text-2xl font-bold text-gray-900">Join EduPredict</CardTitle>
      <CardDescription className="text-gray-600">Create your account</CardDescription>
    </CardHeader>
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
          <Input
  id="fullName"
  type="text"
  placeholder="John Doe"
  value={formData.fullName}
  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
  required
  className="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
/>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">University Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@university.edu"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="bg-gray-100 border-gray-300 text-gray-900"
          />
        </div>

        <div className="space-y-2">
  <Label htmlFor="role" className="text-gray-700">Role</Label>
  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
    <SelectTrigger className="bg-gray-100 border-gray-300 text-gray-900 h-10 w-full">
      <SelectValue placeholder="Select your role" />
    </SelectTrigger>
    <SelectContent 
      className="bg-white border border-gray-300 shadow-lg z-[9999] relative"
      position="popper"
      sideOffset={4}
    >
      <SelectItem 
        value="student" 
        className="cursor-pointer hover:bg-gray-100 text-gray-900 focus:bg-gray-100 focus:text-gray-900"
      >
        Student
      </SelectItem>
      <SelectItem 
        value="lecturer" 
        className="cursor-pointer hover:bg-gray-100 text-gray-900 focus:bg-gray-100 focus:text-gray-900"
      >
        Lecturer
      </SelectItem>
    </SelectContent>
  </Select>
</div>

        <div className="space-y-2">
          <Label htmlFor="idPhoto" className="text-gray-700">ID Photo (for verification)</Label>
          <Input
            id="idPhoto"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="bg-gray-100 border-gray-300 text-gray-900"
          />
        </div>

        
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </form>
  </Card>
</div>
  );
};

export default Signup;
