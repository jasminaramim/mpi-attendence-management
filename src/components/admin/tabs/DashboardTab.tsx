import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Users, CheckCircle, XCircle, FileText, Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { AttendanceCalendar } from '../../shared/AttendanceCalendar';
import { LeaveBalanceCard } from '../../shared/LeaveBalanceCard';
import { ManagerCard } from '../../shared/ManagerCard';
import { showError, showLoading, closeLoading } from '../../../utils/alerts';
import { projectId } from '../../../utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface DashboardTabProps {
  stats: any;
  students: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function DashboardTab({ stats, students, accessToken, onRefresh }: DashboardTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const totalStudents = students.length;
  const presentToday = stats?.presentToday || 0;
  const absentToday = stats?.absentToday || 0;
  const pendingLeaves = stats?.pendingLeaves || 0;

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
        setStudentData(null);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        setSelectedStudent(data.student);
        setStudentData(data);
      } else {
        showError(data.error || 'Student not found');
        setSelectedStudent(null);
        setStudentData(null);
      }
    } catch (error) {
      closeLoading();
      console.error('Search student error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleDateClick = (date: any, attendance: any) => {
    setSelectedDate({ date, attendance });
    setNewStatus(attendance?.status || 'Present');
    setShowAttendanceDialog(true);
  };

  const handleUpdateAttendance = async () => {
    if (!selectedDate || !selectedStudent) return;

    setLoading(true);
    showLoading('Updating attendance...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/update-attendance`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedStudent.studentId,
            date: selectedDate.date,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to update attendance (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        // Refresh student data
        handleSearchStudent();
        setShowAttendanceDialog(false);
      } else {
        showError(data.error || 'Failed to update attendance');
      }
    } catch (error) {
      closeLoading();
      console.error('Update attendance error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-white/90">MPI CST Attendance Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Students</p>
                <h3 className="text-3xl mt-1">{totalStudents}</h3>
              </div>
              <Users className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Present Today</p>
                <h3 className="text-3xl mt-1">{presentToday}</h3>
              </div>
              <CheckCircle className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Absent Today</p>
                <h3 className="text-3xl mt-1">{absentToday}</h3>
              </div>
              <XCircle className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pending Leaves</p>
                <h3 className="text-3xl mt-1">{pendingLeaves}</h3>
              </div>
              <FileText className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Search */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
          <CardTitle className="text-[#27BEEF]">Search Student</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="studentSearch">Student ID / Roll</Label>
              <Input
                id="studentSearch"
                placeholder="Enter student ID or roll number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
              />
            </div>
            <Button
              onClick={handleSearchStudent}
              disabled={loading}
              className="bg-[#27BEEF] hover:bg-[#27BEEF]/90 mt-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Data Display */}
      {selectedStudent && studentData && (
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="text-lg">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="text-lg">{selectedStudent.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaveBalanceCard leaveBalance={studentData.leaveBalance || {}} />
            <ManagerCard manager={studentData.manager || {}} />
          </div>

          <AttendanceCalendar
            attendanceHistory={studentData.attendanceHistory || []}
            onDateClick={handleDateClick}
            isAdmin={true}
          />
        </div>
      )}

      {/* Recent Students */}
      {!selectedStudent && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
            <CardTitle className="text-[#27BEEF]">Recent Students</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student ID</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 10).map((student, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{student.studentId}</td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.email}</td>
                      <td className="py-3 px-4">{student.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <p className="text-center text-gray-500 py-8">No students found</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Attendance Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Date</Label>
              <p className="text-lg">{selectedDate?.date}</p>
            </div>
            <div>
              <Label>Student</Label>
              <p className="text-lg">{selectedStudent?.name}</p>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateAttendance}
                disabled={loading}
                className="flex-1 bg-[#27BEEF]"
              >
                Update
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAttendanceDialog(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
