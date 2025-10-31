import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { MessageSquare } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';

interface ComplaintsTabProps {
  complaints: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ComplaintsTab({ complaints, accessToken, onRefresh }: ComplaintsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Submitting complaint...');

    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/submit-complaint`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject, description }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Complaint submitted successfully!');
        setDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to submit complaint');
      }
    } catch (error) {
      closeLoading();
      console.error('Submit error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-500">Under Review</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <CardTitle>My Complaints</CardTitle>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input name="subject" placeholder="Brief description" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" rows={5} required />
              </div>
              <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {complaints.map((complaint, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm">{complaint.subject}</h3>
                  <p className="text-xs text-gray-500">Submitted on {complaint.submittedOn}</p>
                </div>
                {getStatusBadge(complaint.status)}
              </div>
              <p className="text-xs text-gray-600 mb-2">{complaint.description}</p>
              {complaint.response && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs"><strong>Admin Response:</strong> {complaint.response}</p>
                </div>
              )}
            </div>
          ))}
          {complaints.length === 0 && (
            <p className="text-center text-gray-500 py-8">No complaints submitted yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
