import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { MessageSquare } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';

interface ManageComplaintsTabProps {
  complaints: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageComplaintsTab({ complaints, accessToken, onRefresh }: ManageComplaintsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRespond = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Sending response...');

    const formData = new FormData(e.currentTarget);
    const response = formData.get('response') as string;
    const status = formData.get('status') as string;

    try {
      const apiResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/update-complaint-status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ complaintId: selectedComplaint.id, response, status }),
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: `HTTP ${apiResponse.status}: ${apiResponse.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to send response (${apiResponse.status})`);
        return;
      }

      const data = await apiResponse.json();
      closeLoading();

      if (data.success) {
        showSuccess('Response sent successfully!');
        setDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to send response');
      }
    } catch (error) {
      closeLoading();
      console.error('Respond error:', error);
      showError('Network error. Please check your connection and try again.');
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
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <CardTitle>Manage Complaints</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {complaints.map((complaint, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm">
                    <strong>{complaint.studentName}</strong> ({complaint.studentId})
                  </p>
                  <p className="text-xs text-gray-500">Submitted on {complaint.submittedOn}</p>
                </div>
                {getStatusBadge(complaint.status)}
              </div>
              <h3 className="text-sm mb-1">{complaint.subject}</h3>
              <p className="text-xs text-gray-600 mb-2">{complaint.description}</p>
              {complaint.response && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs"><strong>Response:</strong> {complaint.response}</p>
                </div>
              )}
              {complaint.status !== 'Resolved' && (
                <Button
                  size="sm"
                  className="mt-3 bg-[#27BEEF]"
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setDialogOpen(true);
                  }}
                >
                  Respond
                </Button>
              )}
            </div>
          ))}
          {complaints.length === 0 && (
            <p className="text-center text-gray-500 py-8">No complaints found</p>
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Complaint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRespond} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm"><strong>Subject:</strong> {selectedComplaint?.subject}</p>
              <p className="text-xs text-gray-600 mt-1">{selectedComplaint?.description}</p>
            </div>
            <div className="space-y-2">
              <Textarea name="response" rows={4} placeholder="Your response..." required />
            </div>
            <div className="space-y-2">
              <select name="status" className="w-full h-10 px-3 rounded-md border" required>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
              {loading ? 'Sending...' : 'Send Response'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
