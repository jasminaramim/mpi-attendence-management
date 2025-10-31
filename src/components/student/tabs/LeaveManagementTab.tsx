import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Plus } from 'lucide-react';
import { LeaveBalanceCard } from '../../shared/LeaveBalanceCard';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';

interface LeaveManagementTabProps {
  leaves: any[];
  leaveBalance: any;
  accessToken: string;
  onRefresh: () => void;
}

export function LeaveManagementTab({ leaves, leaveBalance, accessToken, onRefresh }: LeaveManagementTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApplyLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Submitting leave application...');

    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const reason = formData.get('reason') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/apply-leave`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, startDate, endDate, reason }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Leave application submitted successfully!');
        setDialogOpen(false);
        onRefresh();
      } else {
        showError(data.error || 'Failed to apply leave');
      }
    } catch (error) {
      closeLoading();
      console.error('Apply leave error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white flex flex-row items-center justify-between">
              <CardTitle>My Leave Applications</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Leave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for Leave</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleApplyLeave} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Leave Type</Label>
                      <select name="type" className="w-full h-10 px-3 rounded-md border" required>
                        <option value="CL">Casual Leave (CL)</option>
                        <option value="SL">Sick Leave (SL)</option>
                        <option value="EL">Earn Leave (EL)</option>
                        <option value="LWP">Leave Without Pay (LWP)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input name="startDate" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input name="endDate" type="date" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea name="reason" rows={4} required />
                    </div>
                    <Button type="submit" className="w-full bg-[#27BEEF]" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {leaves.map((leave, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm">{leave.type} - {leave.startDate} to {leave.endDate}</p>
                        <p className="text-xs text-gray-500">{leave.reason}</p>
                      </div>
                      {getStatusBadge(leave.status)}
                    </div>
                  </div>
                ))}
                {leaves.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No leave applications yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <LeaveBalanceCard leaveBalance={leaveBalance} />
        </div>
      </div>
    </div>
  );
}
