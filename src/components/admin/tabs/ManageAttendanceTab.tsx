import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Plus, Edit, Trash2, Download, Search } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading, showConfirm } from '../../../utils/alerts';

interface ManageAttendanceTabProps {
  attendance: any[];
  students: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageAttendanceTab({ attendance, students, accessToken, onRefresh }: ManageAttendanceTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredAttendance = attendance.filter(
    (record) =>
      record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Adding attendance...');

    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const date = formData.get('date') as string;
    const checkIn = formData.get('checkIn') as string;
    const checkOut = formData.get('checkOut') as string;
    const status = formData.get('status') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-add-attendance`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId, date, checkIn, checkOut, status }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Attendance added successfully!');
        setDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to add attendance');
      }
    } catch (error) {
      closeLoading();
      console.error('Add attendance error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleEditAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Updating attendance...');

    const formData = new FormData(e.currentTarget);
    const checkIn = formData.get('checkIn') as string;
    const checkOut = formData.get('checkOut') as string;
    const status = formData.get('status') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-update-attendance`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recordId: selectedRecord.id,
            checkIn,
            checkOut,
            status,
          }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Attendance updated successfully!');
        setEditDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to update attendance');
      }
    } catch (error) {
      closeLoading();
      console.error('Update attendance error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteAttendance = async (recordId: string) => {
    const confirmed = await showConfirm(
      'This will permanently delete this attendance record.',
      'Delete Attendance?'
    );
    if (!confirmed) return;

    showLoading('Deleting attendance...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-delete-attendance`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recordId }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Attendance deleted successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to delete attendance');
      }
    } catch (error) {
      closeLoading();
      console.error('Delete attendance error:', error);
      showError('Network error. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'Student ID', 'Student Name', 'Check In', 'Check Out', 'Duration', 'Status'],
      ...filteredAttendance.map((r) => [
        r.date,
        r.studentId,
        r.studentName,
        r.checkIn || 'N/A',
        r.checkOut || 'N/A',
        r.duration || 'N/A',
        r.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSuccess('CSV exported successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-500';
      case 'Absent':
        return 'bg-red-500';
      case 'Late':
        return 'bg-yellow-500';
      case 'Leave':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>Manage Attendance</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Attendance Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAttendance} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <select name="studentId" className="w-full h-10 px-3 rounded-md border" required>
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.studentId}>
                          {student.studentId} - {student.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check In</Label>
                      <Input name="checkIn" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Check Out</Label>
                      <Input name="checkOut" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select name="status" className="w-full h-10 px-3 rounded-md border" required>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Attendance'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by student ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Student ID</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Check In</th>
                <th className="text-left py-3 px-4">Check Out</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{record.date}</td>
                  <td className="py-3 px-4">{record.studentId}</td>
                  <td className="py-3 px-4">{record.studentName}</td>
                  <td className="py-3 px-4">{record.checkIn || 'N/A'}</td>
                  <td className="py-3 px-4">{record.checkOut || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRecord(record);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAttendance(record.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAttendance.length === 0 && (
            <p className="text-center text-gray-500 py-8">No attendance records found</p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAttendance} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check In</Label>
                <Input name="checkIn" type="time" defaultValue={selectedRecord?.checkIn} />
              </div>
              <div className="space-y-2">
                <Label>Check Out</Label>
                <Input name="checkOut" type="time" defaultValue={selectedRecord?.checkOut} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                className="w-full h-10 px-3 rounded-md border"
                defaultValue={selectedRecord?.status}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
              {loading ? 'Updating...' : 'Update Attendance'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
