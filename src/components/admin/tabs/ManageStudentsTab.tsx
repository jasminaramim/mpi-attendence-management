import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Users, Trash2, Ban, CheckCircle } from 'lucide-react';
import { showConfirm, showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';
import { projectId } from '../../../utils/supabase/info';

interface ManageStudentsTabProps {
  students: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageStudentsTab({ students, accessToken, onRefresh }: ManageStudentsTabProps) {
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
      'Delete Student'
    );

    if (!confirmed) return;

    showLoading('Deleting student...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/delete-student`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Student deleted successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to delete student');
      }
    } catch (error) {
      closeLoading();
      console.error('Delete student error:', error);
      showError('Network error. Please try again.');
    }
  };

  const handleBlockStudent = async (studentId: string, studentName: string, isBlocked: boolean) => {
    const action = isBlocked ? 'unblock' : 'block';
    const confirmed = await showConfirm(
      `Are you sure you want to ${action} ${studentName}?`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} Student`
    );

    if (!confirmed) return;

    showLoading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing student...`);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/block-student`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId, blocked: !isBlocked }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess(`Student ${action}ed successfully!`);
        onRefresh();
      } else {
        showError(data.error || `Failed to ${action} student`);
      }
    } catch (error) {
      closeLoading();
      console.error(`${action} student error:`, error);
      showError('Network error. Please try again.');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <CardTitle>Manage Students</CardTitle>
        </div>
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
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{student.studentId}</td>
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.email}</td>
                  <td className="py-3 px-4">{student.semester}</td>
                  <td className="py-3 px-4">
                    {student.blocked ? (
                      <Badge className="bg-red-500">Blocked</Badge>
                    ) : (
                      <Badge className="bg-green-500">Active</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() =>
                          handleBlockStudent(student.studentId, student.name, student.blocked)
                        }
                      >
                        {student.blocked ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4" />
                            Block
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => handleDeleteStudent(student.studentId, student.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
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
  );
}
