import { useState, useEffect } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { DashboardTab } from './tabs/DashboardTab';
import { AttendanceTab } from './tabs/AttendanceTab';
import { LeaveManagementTab } from './tabs/LeaveManagementTab';
import { NoticeBoardTab } from './tabs/NoticeBoardTab';
import { ComplaintsTab } from './tabs/ComplaintsTab';
import { TeachersTab } from './tabs/TeachersTab';
import { ProfileTab } from '../shared/ProfileTab';
import { projectId } from '../../utils/supabase/info';
import { Toaster } from '../ui/sonner';
import { showConfirm } from '../../utils/alerts';

interface StudentDashboardProps {
  user: any;
  accessToken: string;
  onLogout: () => void;
  onUpdateUser: (user: any) => void;
}

export function StudentDashboard({ user, accessToken, onLogout, onUpdateUser }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendance();
    fetchLeaves();
    fetchLeaveBalance();
    fetchManager();
    fetchNotices();
    fetchComplaints();
    fetchTeachers();

    // Real-time updates: Poll every 30 seconds
    const interval = setInterval(() => {
      fetchAttendance();
      fetchNotices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/my-attendance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch attendance HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setAttendanceHistory(data.attendance || data.records || []);
      } else {
        console.error('Fetch attendance error:', data.error);
      }
    } catch (error) {
      console.error('Fetch attendance network error:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/my-leaves`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch leaves HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setLeaves(data.leaves || []);
      } else {
        console.error('Fetch leaves error:', data.error);
      }
    } catch (error) {
      console.error('Fetch leaves network error:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/leave-balance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch leave balance HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setLeaveBalance(data.balance);
      } else {
        console.error('Fetch leave balance error:', data.error);
      }
    } catch (error) {
      console.error('Fetch leave balance network error:', error);
    }
  };

  const fetchManager = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/my-manager`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch manager HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setManager(data.manager);
      } else {
        console.error('Fetch manager error:', data.error);
      }
    } catch (error) {
      console.error('Fetch manager network error:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/my-notices`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch notices HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setNotices(data.notices || []);
      } else {
        console.error('Fetch notices error:', data.error);
      }
    } catch (error) {
      console.error('Fetch notices network error:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/my-complaints`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch complaints HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        console.error('Fetch complaints error:', data.error);
      }
    } catch (error) {
      console.error('Fetch complaints network error:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/my-teachers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Fetch teachers HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTeachers(data.teachers || []);
      } else {
        console.error('Fetch teachers error:', data.error);
      }
    } catch (error) {
      console.error('Fetch teachers network error:', error);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('Are you sure you want to logout?', 'Logout');
    if (confirmed) {
      onLogout();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            user={user}
            accessToken={accessToken}
            attendanceHistory={attendanceHistory}
            leaveBalance={leaveBalance}
            manager={manager}
            onRefresh={fetchAttendance}
          />
        );
      case 'attendance':
        return <AttendanceTab attendanceHistory={attendanceHistory} />;
      case 'calendar':
        return <AttendanceTab attendanceHistory={attendanceHistory} calendarView={true} />;
      case 'leaves':
        return (
          <LeaveManagementTab
            leaves={leaves}
            leaveBalance={leaveBalance}
            accessToken={accessToken}
            onRefresh={fetchLeaves}
          />
        );
      case 'noticeboard':
        return (
          <NoticeBoardTab
            notices={notices}
            accessToken={accessToken}
            user={user}
            onRefresh={fetchNotices}
          />
        );
      case 'complaints':
        return (
          <ComplaintsTab
            complaints={complaints}
            accessToken={accessToken}
            onRefresh={fetchComplaints}
          />
        );
      case 'teachers':
        return <TeachersTab teachers={teachers} />;
      case 'profile':
        return (
          <ProfileTab
            user={user}
            accessToken={accessToken}
            onUpdateUser={onUpdateUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        role="student"
      />
      <div className="flex-1 ml-64">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
