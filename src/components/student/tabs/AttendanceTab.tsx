import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { AttendanceCalendar } from '../../shared/AttendanceCalendar';

interface AttendanceTabProps {
  attendanceHistory: any[];
  calendarView?: boolean;
}

export function AttendanceTab({ attendanceHistory, calendarView = false }: AttendanceTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-500';
      case 'Absent':
        return 'bg-red-500';
      case 'Late':
        return 'bg-yellow-500';
      case 'Leave':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (calendarView) {
    return <AttendanceCalendar attendanceHistory={attendanceHistory} />;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <CardTitle>My Attendance History</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Check-In</th>
                <th className="text-left py-3 px-4">Check-Out</th>
                <th className="text-left py-3 px-4">Duration</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{record.date}</td>
                  <td className="py-3 px-4">{record.checkIn || 'N/A'}</td>
                  <td className="py-3 px-4">{record.checkOut || 'N/A'}</td>
                  <td className="py-3 px-4">{record.duration || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendanceHistory.length === 0 && (
            <p className="text-center text-gray-500 py-8">No attendance records found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
