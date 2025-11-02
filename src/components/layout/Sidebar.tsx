import { Home, Calendar, FileText, Users, Bell, MessageSquare, GraduationCap, User, LogOut, LayoutDashboard, ClipboardList, UserCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface SidebarProps {
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  role: 'student' | 'admin';
}

export function Sidebar({ user, activeTab, onTabChange, onLogout, role }: SidebarProps) {
  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'attendance', label: 'My Attendance', icon: ClipboardList },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'leaves', label: 'Leave Management', icon: FileText },
    { id: 'noticeboard', label: 'Notice Board', icon: Bell },
    { id: 'complaints', label: 'My Complaints', icon: MessageSquare },
    { id: 'teachers', label: 'My Teachers', icon: GraduationCap },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Manage Attendance', icon: ClipboardList },
    { id: 'students', label: 'Manage Students', icon: Users },
    { id: 'assignments', label: 'Assign Teacher/Manager', icon: UserCheck },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
    { id: 'noticeboard', label: 'Manage Notices', icon: Bell },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'teachers', label: 'Manage Teachers', icon: GraduationCap },
    { id: 'managers', label: 'Manage Managers', icon: UserCheck },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const menuItems = role === 'student' ? studentMenuItems : adminMenuItems;

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-[#27BEEF] to-[#27BEEF]/90 text-white flex flex-col fixed left-0 top-0 shadow-xl">
      {/* Header */}
      <div className="p-6 bg-[#27BEEF]">
        <h1 className="text-2xl text-center mb-1">MPI CST</h1>
        <p className="text-xs text-center text-white/80">Attendance System</p>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 bg-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarFallback className="bg-[#F4A247] text-white">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-white/70 truncate">
              {role === 'student' ? user?.studentId : 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/20" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-[#27BEEF] shadow-lg'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
