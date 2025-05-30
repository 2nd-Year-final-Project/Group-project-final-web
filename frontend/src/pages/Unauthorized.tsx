
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-gray-900 border-pink-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-pink-400">Access Denied</CardTitle>
          <CardDescription className="text-gray-300">You don't have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400">
            Please contact your administrator if you believe this is an error.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
