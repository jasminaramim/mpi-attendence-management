import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { GraduationCap, Phone, Mail } from 'lucide-react';

interface TeachersTabProps {
  teachers: any[];
}

export function TeachersTab({ teachers }: TeachersTabProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6" />
          <CardTitle>My Teachers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {teachers.map((teacher, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#27BEEF] text-white">
                    {teacher.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-lg">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.subject}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{teacher.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span>{teacher.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <p className="text-center text-gray-500 py-8 col-span-2">
              No teachers assigned yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
