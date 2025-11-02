import { useState, useEffect } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { DashboardTab } from './tabs/DashboardTab';
import { ManageAttendanceTab } from './tabs/ManageAttendanceTab';
import { ManageStudentsTab } from './tabs/ManageStudentsTab';
import { ManageLeavesTab } from './tabs/ManageLeavesTab';
import { ManageNoticesTab } from './tabs/ManageNoticesTab';
import { ManageComplaintsTab } from './tabs/ManageComplaintsTab';
import { ManageTeachersTab } from './tabs/ManageTeachersTab';
import { ProfileTab } from '../shared/ProfileTab';
import { projectId } from '../../utils/supabase/info';
import { Toaster } from '../ui/sonner';
import { showConfirm } from '../../utils/alerts';

interface AdminDashboardProps {
  user: any;
  accessToken: string;
  onLogout: () => void;
  onUpdateUser: (user: any) => void;
}

export function AdminDashboard({ user, accessToken, onLogout, onUpdateUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchStudents();
    fetchAllAttendance();
    fetchAllLeaves();
    fetchNotices();
    fetchComplaints();
    fetchTeachers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error('Fetch stats HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Fetch stats error:', data.error);
      }
    } catch (error) {
      console.error('Fetch stats network error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/all-students`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error('Fetch students HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      } else {
        console.error('Fetch students error:', data.error);
      }
    } catch (error) {
      console.error('Fetch students network error:', error);
    }
  };

  const fetchAllAttendance = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/all-attendance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error('Fetch attendance HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setAllAttendance(data.records || []);
      } else {
        console.error('Fetch attendance error:', data.error);
      }
    } catch (error) {
      console.error('Fetch attendance network error:', error);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/all-leaves`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error('Fetch leaves HTTP error:', errorData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setAllLeaves(data.leaves || []);
      } else {
        console.error('Fetch leaves error:', data.error);
      }
    } catch (error) {
      console.error('Fetch leaves network error:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/all-notices`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (error) {
      console.error('Fetch notices error:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/all-complaints`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Fetch complaints error:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/all-teachers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Fetch teachers error:', error);
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
            stats={stats} 
            students={students} 
            accessToken={accessToken}
            onRefresh={() => {
              fetchStats();
              fetchStudents();
              fetchAllAttendance();
            }}
          />
        );
      case 'attendance':
        return (
          <ManageAttendanceTab
            attendance={allAttendance}
            students={students}
            accessToken={accessToken}
            onRefresh={fetchAllAttendance}
          />
        );
      case 'students':
        return (
          <ManageStudentsTab
            students={students}
            accessToken={accessToken}
            onRefresh={fetchStudents}
          />
        );
      case 'leaves':
        return (
          <ManageLeavesTab
            leaves={allLeaves}
            accessToken={accessToken}
            onRefresh={fetchAllLeaves}
          />
        );
      case 'noticeboard':
        return (
          <ManageNoticesTab
            notices={notices}
            accessToken={accessToken}
            onRefresh={fetchNotices}
          />
        );
      case 'complaints':
        return (
          <ManageComplaintsTab
            complaints={complaints}
            accessToken={accessToken}
            onRefresh={fetchComplaints}
          />
        );
      case 'teachers':
        return (
          <ManageTeachersTab
            teachers={teachers}
            accessToken={accessToken}
            onRefresh={fetchTeachers}
          />
        );
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
        role="admin"
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
