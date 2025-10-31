import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading, showConfirm } from '../../../utils/alerts';

interface ManageTeachersTabProps {
  teachers: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageTeachersTab({ teachers, accessToken, onRefresh }: ManageTeachersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Adding teacher...');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const semester = formData.get('semester') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-add-teacher`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, subject, phone, email, semester }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Teacher added successfully!');
        setDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to add teacher');
      }
    } catch (error) {
      closeLoading();
      console.error('Add teacher error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const confirmed = await showConfirm('This will permanently delete this teacher.', 'Delete Teacher?');
    if (!confirmed) return;

    showLoading('Deleting teacher...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-delete-teacher`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ teacherId }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Teacher deleted successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to delete teacher');
      }
    } catch (error) {
      closeLoading();
      console.error('Delete teacher error:', error);
      showError('Network error. Please try again.');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6" />
          <CardTitle>Manage Teachers</CardTitle>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" placeholder="Teacher name" required />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input name="subject" placeholder="Subject/Course" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" placeholder="Phone number" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="Email address" required />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input name="semester" placeholder="Semester (e.g., Semester 1)" required />
              </div>
              <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
                {loading ? 'Adding...' : 'Add Teacher'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {teachers.map((teacher, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-lg">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.subject}</p>
                  <p className="text-xs text-gray-500 mt-2">Semester: {teacher.semester}</p>
                  <p className="text-xs text-gray-500">Phone: {teacher.phone}</p>
                  <p className="text-xs text-gray-500">Email: {teacher.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <p className="text-center text-gray-500 py-8 col-span-2">No teachers added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
