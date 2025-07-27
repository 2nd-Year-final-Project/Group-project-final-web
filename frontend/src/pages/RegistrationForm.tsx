import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Upload, User, Mail, UserCheck, Image } from 'lucide-react';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    idCard: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, idCard: file });

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('idCard', formData.idCard);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Registration submitted for admin approval.');
        setFormData({
          fullName: '',
          email: '',
          role: 'student',
          idCard: null,
        });
        setPreview(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">EduTrack</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Create an Account</CardTitle>
            <CardDescription className="text-gray-300">
              Join our academic prediction platform
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Akila Fernando"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  University Email
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. akila@student.kln.ac.lk"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="student" className="text-white hover:bg-gray-600">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">Student</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="lecturer" className="text-white hover:bg-gray-600">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-purple-400 border-purple-400">Lecturer</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ID Card Upload */}
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Upload University ID Card
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    name="idCard"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="sr-only"
                    id="idCard"
                  />
                  <label
                    htmlFor="idCard"
                    className="flex items-center justify-between w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2.5 h-10 text-white hover:border-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <span className="text-gray-300 text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-400" />
                      {formData.idCard ? formData.idCard.name : "Choose file..."}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                      Browse
                    </span>
                  </label>
                </div>
                
                {preview && (
                  <div className="mt-4 p-2 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">ID Preview</span>
                    </div>
                    <img
                      src={preview}
                      alt="ID Preview"
                      className="w-full h-40 object-cover rounded-lg border border-gray-600 shadow-lg"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Register for Approval
              </Button>

              {/* Info Banner */}
              <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-200">
                    <span className="font-medium">Note:</span> Your registration will be reviewed by administrators. 
                    You'll receive access once approved.
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RegistrationForm;