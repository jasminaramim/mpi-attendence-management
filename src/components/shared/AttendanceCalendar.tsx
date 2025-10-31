import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { getBangladeshTime } from '../../utils/dateTime';

interface AttendanceCalendarProps {
  attendanceHistory: any[];
  onDateClick?: (date: string, attendance: any) => void;
  isAdmin?: boolean;
}

export function AttendanceCalendar({ attendanceHistory, onDateClick, isAdmin = false }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(getBangladeshTime());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getAttendanceForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return attendanceHistory.find((record) => record.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-500 text-white';
      case 'Absent':
        return 'bg-red-500 text-white';
      case 'Late':
        return 'bg-yellow-500 text-white';
      case 'Leave':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#27BEEF]">Attendance Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              {monthNames[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs p-2 bg-[#27BEEF] text-white rounded">
              {day.slice(0, 3)}
            </div>
          ))}

          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const attendance = getAttendanceForDate(day);
            const isToday =
              day === getBangladeshTime().getDate() &&
              month === getBangladeshTime().getMonth() &&
              year === getBangladeshTime().getFullYear();
            const dayOfWeek = new Date(year, month, day).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const dateStr = new Date(year, month, day).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={day}
                className={`aspect-square p-2 border rounded-lg text-center transition-all hover:shadow-md ${
                  isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-[#27BEEF]' : 'cursor-default'
                } ${
                  attendance ? getStatusColor(attendance.status) : isWeekend ? 'bg-gray-100' : 'bg-white'
                } ${isToday ? 'ring-2 ring-[#F4A247]' : ''}`}
                title={attendance ? `${attendance.status} - ${attendance.checkIn || 'N/A'}` : ''}
                onClick={() => isAdmin && onDateClick?.(dateStr, attendance)}
              >
                <div className="text-sm">{day}</div>
                {attendance && (
                  <div className="text-xs mt-1">{attendance.status.slice(0, 3)}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-xs">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border" />
            <span className="text-xs">Offday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
