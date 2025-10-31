import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { FileText, Check, X } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';

interface ManageLeavesTabProps {
  leaves: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function ManageLeavesTab({ leaves, accessToken, onRefresh }: ManageLeavesTabProps) {
  const handleApprove = async (leaveId: string) => {
    showLoading('Approving leave...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-approve-leave`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leaveId, status: 'Approved' }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Leave approved successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to approve leave');
      }
    } catch (error) {
      closeLoading();
      console.error('Approve leave error:', error);
      showError('Network error. Please try again.');
    }
  };

  const handleReject = async (leaveId: string) => {
    showLoading('Rejecting leave...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/admin-approve-leave`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leaveId, status: 'Rejected' }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Leave rejected successfully!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to reject leave');
      }
    } catch (error) {
      closeLoading();
      console.error('Reject leave error:', error);
      showError('Network error. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <CardTitle>Manage Leave Requests</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {leaves.map((leave, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm">
                    <strong>{leave.studentName}</strong> ({leave.studentId})
                  </p>
                  <p className="text-xs text-gray-500">
                    {leave.type} - {leave.startDate} to {leave.endDate}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                </div>
                {getStatusBadge(leave.status)}
              </div>
              {leave.status === 'Pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleApprove(leave.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleReject(leave.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
          {leaves.length === 0 && (
            <p className="text-center text-gray-500 py-8">No leave requests found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
