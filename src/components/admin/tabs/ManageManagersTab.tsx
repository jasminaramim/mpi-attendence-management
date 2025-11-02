import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { UserCheck, Plus, Trash2 } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading, showConfirm } from '../../../utils/alerts';

interface ManageManagersTabProps {
  managers: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageManagersTab({ managers, accessToken, onRefresh }: ManageManagersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Adding manager...');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const designation = formData.get('designation') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/add-manager`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, designation, phone, email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to add manager (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Manager added successfully!');
        setDialogOpen(false);
        // Reset form
        const form = e.currentTarget;
        form.reset();
        onRefresh();
      } else {
        showError(data.error || 'Failed to add manager');
      }
    } catch (error) {
      closeLoading();
      console.error('Add manager error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleDeleteManager = async (managerId: string) => {
    const confirmed = await showConfirm('This will permanently delete this manager.', 'Delete Manager?');
    if (!confirmed) return;

    showLoading('Deleting manager...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/delete-manager`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ managerId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to delete manager (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Manager deleted successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to delete manager');
      }
    } catch (error) {
      closeLoading();
      console.error('Delete manager error:', error);
      showError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6" />
          <CardTitle>Manage Managers</CardTitle>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddManager} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" placeholder="Manager name" required />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input name="designation" placeholder="Designation/Role" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" placeholder="Phone number" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="Email address" required />
              </div>
              <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
                {loading ? 'Adding...' : 'Add Manager'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {managers.map((manager, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-lg">{manager.name}</p>
                  <p className="text-sm text-gray-600">{manager.designation}</p>
                  <p className="text-xs text-gray-500 mt-2">Phone: {manager.phone}</p>
                  <p className="text-xs text-gray-500">Email: {manager.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteManager(manager.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {managers.length === 0 && (
            <p className="text-center text-gray-500 py-8 col-span-2">No managers added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

