
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  full_name: string;
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
    quiz1: '',
    quiz2: '',
    assignment1: '',
    assignment2: '',
    midterm_marks: ''
  });

  // Reset form when student changes or modal opens
  useEffect(() => {
    if (student) {
      setMarks({
        quiz1: student.quiz1?.toString() || '',
        quiz2: student.quiz2?.toString() || '',
        assignment1: student.assignment1?.toString() || '',
        assignment2: student.assignment2?.toString() || '',
        midterm_marks: student.midterm?.toString() || ''
      });
    }
  }, [student, isOpen]);

  const handleSave = () => {
    if (student) {
      // Validate marks are within range
      const markValues = [marks.quiz1, marks.quiz2, marks.assignment1, marks.assignment2, marks.midterm_marks];
      
      for (const mark of markValues) {
        if (mark !== '' && (parseFloat(mark) < 0 || parseFloat(mark) > 100)) {
          return; // Invalid marks will be handled by HTML5 validation
        }
      }
      
      // Convert string values to numbers (or null for empty strings)
      const numericMarks = {
        quiz1: marks.quiz1 !== '' ? parseFloat(marks.quiz1) : null,
        quiz2: marks.quiz2 !== '' ? parseFloat(marks.quiz2) : null,
        assignment1: marks.assignment1 !== '' ? parseFloat(marks.assignment1) : null,
        assignment2: marks.assignment2 !== '' ? parseFloat(marks.assignment2) : null,
        midterm_marks: marks.midterm_marks !== '' ? parseFloat(marks.midterm_marks) : null
      };
      
      onSave(student.id, numericMarks);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Enter Marks - {student?.full_name}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Input marks for all assessments (0-100). Leave empty if not yet graded.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quiz1" className="text-gray-200">Quiz 1 <span className="text-gray-400">(0-100)</span></Label>
            <Input
              id="quiz1"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={marks.quiz1}
              onChange={(e) => setMarks(prev => ({ ...prev, quiz1: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quiz2" className="text-gray-200">Quiz 2 <span className="text-gray-400">(0-100)</span></Label>
            <Input
              id="quiz2"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={marks.quiz2}
              onChange={(e) => setMarks(prev => ({ ...prev, quiz2: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignment1" className="text-gray-200">Assignment 1 <span className="text-gray-400">(0-100)</span></Label>
            <Input
              id="assignment1"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={marks.assignment1}
              onChange={(e) => setMarks(prev => ({ ...prev, assignment1: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignment2" className="text-gray-200">Assignment 2 <span className="text-gray-400">(0-100)</span></Label>
            <Input
              id="assignment2"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={marks.assignment2}
              onChange={(e) => setMarks(prev => ({ ...prev, assignment2: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2 col-span-2">
            <Label htmlFor="midterm" className="text-gray-200">Midterm Exam <span className="text-gray-400">(0-100)</span></Label>
            <Input
              id="midterm"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={marks.midterm_marks}
              onChange={(e) => setMarks(prev => ({ ...prev, midterm_marks: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mt-4 p-3 bg-gray-700 rounded">
          <strong>Note:</strong> Leave fields empty if not yet graded.
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Marks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarksEntryModal;
