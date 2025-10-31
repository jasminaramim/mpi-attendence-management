import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading, showConfirm } from '../../../utils/alerts';

interface ManageNoticesTabProps {
  notices: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageNoticesTab({ notices, accessToken, onRefresh }: ManageNoticesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePostNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Posting notice...');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const targetAudience = formData.get('targetAudience') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-post-notice`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content, targetAudience }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Notice posted successfully!');
        setDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to post notice');
      }
    } catch (error) {
      closeLoading();
      console.error('Post notice error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    const confirmed = await showConfirm('This will permanently delete this notice.', 'Delete Notice?');
    if (!confirmed) return;

    showLoading('Deleting notice...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-delete-notice`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ noticeId }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Notice deleted successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to delete notice');
      }
    } catch (error) {
      closeLoading();
      console.error('Delete notice error:', error);
      showError('Network error. Please try again.');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <CardTitle>Manage Notices</CardTitle>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Post Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post New Notice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" placeholder="Notice title" required />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea name="content" rows={5} required />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <select name="targetAudience" className="w-full h-10 px-3 rounded-md border" required>
                  <option value="All">All</option>
                  <option value="Students">Students Only</option>
                  <option value="Admins">Admins Only</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
                {loading ? 'Posting...' : 'Post Notice'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg">{notice.title}</h3>
                  <p className="text-xs text-gray-500">Posted by {notice.postedBy} on {notice.postedOn}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{notice.targetAudience}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteNotice(notice.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{notice.content}</p>
            </div>
          ))}
          {notices.length === 0 && (
            <p className="text-center text-gray-500 py-8">No notices posted yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
