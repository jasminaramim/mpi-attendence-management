import { Card, CardContent } from '../ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate, formatTime, getBangladeshTime } from '../../utils/dateTime';

interface CheckInOutCardProps {
  attendanceHistory: any[];
}

export function CheckInOutCard({ attendanceHistory }: CheckInOutCardProps) {
  const recentRecords = attendanceHistory.slice(0, 4);
  const today = formatDate();

  return (
    <div className="space-y-3">
      {recentRecords.map((record, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm">{record.date}</p>
                <p className="text-xs text-gray-500">
                  {record.duration || 'In Progress'}
                </p>
              </div>
              {record.date === today && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {record.checkIn && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-500">Check In</span>
                  </div>
                  <span className="text-sm text-[#27BEEF]">{record.checkIn}</span>
                </div>
              )}
              {record.checkOut && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-gray-500">Check Out</span>
                  </div>
                  <span className="text-sm text-[#F4A247]">{record.checkOut}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
