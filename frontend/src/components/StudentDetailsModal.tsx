
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Student {
  id: string;
  name: string;
  email: string;
  attendance?: number;
  motivation?: number;
  teacherQuality?: number;
}

interface StudentDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, data: any) => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ 
  student, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    attendance: student?.attendance || '',
    motivation: student?.motivation || '',
    teacherQuality: student?.teacherQuality || ''
  });

  const handleSave = () => {
    if (student) {
      onSave(student.id, formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Student Details - {student?.name}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Input administrative data for {student?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance" className="text-gray-200">Attendance (%)</Label>
            <Input
              id="attendance"
              type="number"
              min="0"
              max="100"
              placeholder="85"
              value={formData.attendance}
              onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-gray-200">Motivation Level (1-10)</Label>
            <Input
              id="motivation"
              type="number"
              min="1"
              max="10"
              placeholder="7"
              value={formData.motivation}
              onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teacherQuality" className="text-gray-200">Teacher Quality Rating (1-10)</Label>
            <Input
              id="teacherQuality"
              type="number"
              min="1"
              max="10"
              placeholder="8"
              value={formData.teacherQuality}
              onChange={(e) => setFormData(prev => ({ ...prev, teacherQuality: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;
