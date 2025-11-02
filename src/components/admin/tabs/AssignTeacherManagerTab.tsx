import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { UserCheck, GraduationCap, Search, Check } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface AssignTeacherManagerTabProps {
  students: any[];
  teachers: any[];
  managers: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function AssignTeacherManagerTab({ students, teachers, managers, accessToken, onRefresh }: AssignTeacherManagerTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSearchStudent = async () => {
    if (!searchQuery.trim()) {
      showError('Please enter a student ID or Roll');
      return;
    }

    setLoading(true);
    showLoading('Searching student...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/get-student-data?studentId=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to search student (${response.status})`);
        setSelectedStudent(null);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        setSelectedStudent(data.student);
        // Load current assignments if any
        const currentTeacher = await fetchStudentTeacher(data.student.studentId);
        const currentManager = await fetchStudentManager(data.student.studentId);
        setSelectedTeacher(currentTeacher || '');
        setSelectedManager(currentManager || '');
      } else {
        showError(data.error || 'Student not found');
        setSelectedStudent(null);
      }
    } catch (error) {
      closeLoading();
      console.error('Search student error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const fetchStudentTeacher = async (studentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/get-student-teacher?studentId=${encodeURIComponent(studentId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.teacherId || '';
      }
    } catch (error) {
      console.error('Fetch student teacher error:', error);
    }
    return '';
  };

  const fetchStudentManager = async (studentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/get-student-manager?studentId=${encodeURIComponent(studentId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.managerId || '';
      }
    } catch (error) {
      console.error('Fetch student manager error:', error);
    }
    return '';
  };

  const handleAssignTeacher = async () => {
    if (!selectedStudent || !selectedTeacher) {
      showError('Please select a student and teacher');
      return;
    }

    setLoading(true);
    showLoading('Assigning teacher...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/assign-teacher`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedStudent.studentId,
            teacherId: selectedTeacher,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to assign teacher (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Teacher assigned successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to assign teacher');
      }
    } catch (error) {
      closeLoading();
      console.error('Assign teacher error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleAssignManager = async () => {
    if (!selectedStudent || !selectedManager) {
      showError('Please select a student and manager');
      return;
    }

    setLoading(true);
    showLoading('Assigning manager...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/assign-manager`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedStudent.studentId,
            managerId: selectedManager,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to assign manager (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Manager assigned successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to assign manager');
      }
    } catch (error) {
      closeLoading();
      console.error('Assign manager error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6" />
            <CardTitle>Assign Teacher & Manager</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Student Search */}
          <div className="mb-6">
            <Label htmlFor="studentSearch" className="mb-2 block">Search Student by ID/Roll</Label>
            <div className="flex gap-3">
              <Input
                id="studentSearch"
                placeholder="Enter student ID or roll number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
                className="flex-1"
              />
              <Button
                onClick={handleSearchStudent}
                disabled={loading}
                className="bg-[#27BEEF] hover:bg-[#27BEEF]/90"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedStudent.studentId} | Semester: {selectedStudent.semester}</p>
                </div>
                <Badge className="bg-green-500">Selected</Badge>
              </div>
            </div>
          )}

          {/* Assignment Forms */}
          {selectedStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assign Teacher */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Assign Teacher
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label>Select Teacher</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.subject} ({teacher.semester})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignTeacher}
                    disabled={loading || !selectedTeacher}
                    className="w-full bg-[#27BEEF]"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Assign Teacher
                  </Button>
                </CardContent>
              </Card>

              {/* Assign Manager */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Assign Manager
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label>Select Manager</Label>
                    <Select value={selectedManager} onValueChange={setSelectedManager}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} - {manager.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignManager}
                    disabled={loading || !selectedManager}
                    className="w-full bg-[#F4A247]"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Assign Manager
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {!selectedStudent && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Search for a student to assign teacher and manager</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

