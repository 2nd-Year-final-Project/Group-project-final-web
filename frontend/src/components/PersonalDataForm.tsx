
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

const PersonalDataForm = () => {
  const [formData, setFormData] = useState({
    studyHours: '',
    gender: '',
    sleepHours: '',
    peerInfluence: '',
    extracurricular: '',
    physicalActivity: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Personal data submitted:', formData);
    toast({ title: "Data saved successfully", description: "Your personal data has been updated for better predictions." });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Personal Data for Predictive Analytics</CardTitle>
        <CardDescription className="text-gray-300">
          Help us provide better predictions by updating your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studyHours" className="text-gray-200">Daily Study Hours</Label>
              <Input
                id="studyHours"
                type="number"
                min="0"
                max="24"
                placeholder="6"
                value={formData.studyHours}
                onChange={(e) => setFormData(prev => ({ ...prev, studyHours: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-200">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sleepHours" className="text-gray-200">Average Sleep Hours</Label>
              <Input
                id="sleepHours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="7.5"
                value={formData.sleepHours}
                onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="peerInfluence" className="text-gray-200">Peer Influence Level (1-10)</Label>
              <Input
                id="peerInfluence"
                type="number"
                min="1"
                max="10"
                placeholder="7"
                value={formData.peerInfluence}
                onChange={(e) => setFormData(prev => ({ ...prev, peerInfluence: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="extracurricular" className="text-gray-200">Extracurricular Participation (hours/week)</Label>
              <Input
                id="extracurricular"
                type="number"
                min="0"
                placeholder="5"
                value={formData.extracurricular}
                onChange={(e) => setFormData(prev => ({ ...prev, extracurricular: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="physicalActivity" className="text-gray-200">Physical Activity (hours/week)</Label>
              <Input
                id="physicalActivity"
                type="number"
                min="0"
                placeholder="4"
                value={formData.physicalActivity}
                onChange={(e) => setFormData(prev => ({ ...prev, physicalActivity: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-6">
            Save Personal Data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalDataForm;
