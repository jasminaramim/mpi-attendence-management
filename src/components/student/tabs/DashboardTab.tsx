import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Clock, Calendar, FileText, TrendingUp } from 'lucide-react';
import { AttendanceCalendar } from '../../shared/AttendanceCalendar';
import { ManagerCard } from '../../shared/ManagerCard';
import { LeaveBalanceCard } from '../../shared/LeaveBalanceCard';
import { CheckInOutCard } from '../../shared/CheckInOutCard';
import { projectId } from '../../../utils/supabase/info';
import { formatDate, formatTime } from '../../../utils/dateTime';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';
import { toast } from 'sonner@2.0.3';

interface DashboardTabProps {
  user: any;
  accessToken: string;
  attendanceHistory: any[];
  leaveBalance: any;
  manager: any;
  onRefresh: () => void;
}

export function DashboardTab({ user, accessToken, attendanceHistory, leaveBalance, manager, onRefresh }: DashboardTabProps) {
  const [loading, setLoading] = useState(false);

  const today = formatDate();
  const todayRecord = attendanceHistory.find((record) => record.date === today);

  const handleCheckIn = async () => {
    setLoading(true);
    showLoading('Checking in...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/check-in`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to check in (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess(`Checked in at ${data.record?.checkIn || data.attendance?.checkIn}`, 'Check-in Successful!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to check in');
      }
    } catch (error) {
      closeLoading();
      console.error('Check-in error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    showLoading('Checking out...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/check-out`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        closeLoading();
        showError(errorData.error || `Failed to check out (${response.status})`);
        return;
      }

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess(`Checked out at ${data.record?.checkOut || data.attendance?.checkOut}. Total duration: ${data.record?.duration || data.attendance?.duration}`, 'Check-out Successful!');
        onRefresh();
      } else {
        showError(data.error || 'Failed to check out');
      }
    } catch (error) {
      closeLoading();
      console.error('Check-out error:', error);
      showError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  // Calculate stats - exclude off days
  const workingDays = attendanceHistory.filter((r) => r.status !== 'OFFDAY');
  const totalDays = workingDays.length;
  const presentDays = workingDays.filter((r) => r.status === 'Present').length;
  const leaveDays = workingDays.filter((r) => r.status === 'Leave').length;
  const absentDays = workingDays.filter((r) => r.status === 'Absent').length;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-white/90">Student ID: {user?.studentId} | Semester: {user?.semester}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Attendance Rate</p>
                <h3 className="text-3xl mt-1">{attendancePercentage}%</h3>
              </div>
              <TrendingUp className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Days</p>
                <h3 className="text-3xl mt-1">{totalDays}</h3>
              </div>
              <Calendar className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Leave Days</p>
                <h3 className="text-3xl mt-1">{leaveDays}</h3>
              </div>
              <FileText className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Absent Days</p>
                <h3 className="text-3xl mt-1">{absentDays}</h3>
              </div>
              <Clock className="w-10 h-10 text-white/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar and Check-in/out */}
        <div className="lg:col-span-2 space-y-6">
          {/* Check-in/Check-out Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
              <CardTitle className="text-[#27BEEF]">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-around">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Check-In Time</p>
                  <p className="text-2xl text-[#27BEEF]">{todayRecord?.checkIn || '--:--'}</p>
                </div>
                <div className="flex gap-3">
                  {(() => {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const isOffDay = dayOfWeek === 5 || dayOfWeek === 6; // Friday = 5, Saturday = 6
                    
                    if (isOffDay) {
                      return (
                        <div className="text-center">
                          <p className="text-gray-500 text-sm font-semibold">OFFDAY</p>
                          <p className="text-gray-400 text-xs mt-1">Friday/Saturday - No attendance required</p>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        <Button
                          onClick={handleCheckIn}
                          disabled={loading || !!todayRecord?.checkIn}
                          className="bg-[#27BEEF] hover:bg-[#27BEEF]/90"
                        >
                          Check In
                        </Button>
                        <Button
                          onClick={handleCheckOut}
                          disabled={loading || !todayRecord?.checkIn || !!todayRecord?.checkOut}
                          className="bg-[#F4A247] hover:bg-[#F4A247]/90"
                        >
                          Check Out
                        </Button>
                      </>
                    );
                  })()}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Check-Out Time</p>
                  <p className="text-2xl text-[#F4A247]">{todayRecord?.checkOut || '--:--'}</p>
                </div>
              </div>
              {todayRecord?.duration && (
                <div className="mt-4 text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Today's Duration</p>
                  <p className="text-xl text-green-600">{todayRecord.duration}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Calendar */}
          <AttendanceCalendar attendanceHistory={attendanceHistory} />

          {/* Recent Check-in/out History */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
              <CardTitle className="text-[#27BEEF]">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <CheckInOutCard attendanceHistory={attendanceHistory} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Manager and Leave Balance */}
        <div className="space-y-6">
          <ManagerCard manager={manager} />
          <LeaveBalanceCard leaveBalance={leaveBalance} />
        </div>
      </div>
    </div>
  );
}
