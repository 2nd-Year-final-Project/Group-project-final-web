
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  name: string;
  quiz1?: number;
  quiz2?: number;
  assignment1?: number;
  assignment2?: number;
  midterm?: number;
}

interface MarksEntryModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, marks: any) => void;
}

const MarksEntryModal: React.FC<MarksEntryModalProps> = ({ 
  student, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [marks, setMarks] = useState({
    quiz1: student?.quiz1 || '',
    quiz2: student?.quiz2 || '',
    assignment1: student?.assignment1 || '',
    assignment2: student?.assignment2 || '',
    midterm: student?.midterm || ''
  });

  const handleSave = () => {
    if (student) {
      onSave(student.id, marks);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Enter Marks - {student?.name}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Input marks for all assessments (0-100)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quiz1" className="text-gray-200">Quiz 1</Label>
            <Input
              id="quiz1"
              type="number"
              min="0"
              max="100"
              placeholder="85"
              value={marks.quiz1}
              onChange={(e) => setMarks(prev => ({ ...prev, quiz1: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quiz2" className="text-gray-200">Quiz 2</Label>
            <Input
              id="quiz2"
              type="number"
              min="0"
              max="100"
              placeholder="92"
              value={marks.quiz2}
              onChange={(e) => setMarks(prev => ({ ...prev, quiz2: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignment1" className="text-gray-200">Assignment 1</Label>
            <Input
              id="assignment1"
              type="number"
              min="0"
              max="100"
              placeholder="78"
              value={marks.assignment1}
              onChange={(e) => setMarks(prev => ({ ...prev, assignment1: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignment2" className="text-gray-200">Assignment 2</Label>
            <Input
              id="assignment2"
              type="number"
              min="0"
              max="100"
              placeholder="88"
              value={marks.assignment2}
              onChange={(e) => setMarks(prev => ({ ...prev, assignment2: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2 col-span-2">
            <Label htmlFor="midterm" className="text-gray-200">Midterm Exam</Label>
            <Input
              id="midterm"
              type="number"
              min="0"
              max="100"
              placeholder="82"
              value={marks.midterm}
              onChange={(e) => setMarks(prev => ({ ...prev, midterm: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Marks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarksEntryModal;
