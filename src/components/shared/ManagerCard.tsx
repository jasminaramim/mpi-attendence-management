import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Phone } from 'lucide-react';

interface ManagerCardProps {
  manager: {
    supervisor: string;
    supervisorDesignation: string;
    supervisorPhone: string;
    dottedSupervisor: string;
    dottedSupervisorPhone: string;
    lineManager: string;
    lineManagerPhone: string;
  } | null;
}

export function ManagerCard({ manager }: ManagerCardProps) {
  if (!manager) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No manager assigned yet</p>
        </CardContent>
      </Card>
    );
  }

  const managers = [
    {
      name: manager.supervisor,
      designation: manager.supervisorDesignation,
      phone: manager.supervisorPhone,
      role: 'Supervisor',
      color: 'bg-[#27BEEF]',
    },
    {
      name: manager.dottedSupervisor,
      designation: 'Dotted Supervisor',
      phone: manager.dottedSupervisorPhone,
      role: 'Dotted Supervisor',
      color: 'bg-[#F4A247]',
    },
    {
      name: manager.lineManager,
      designation: 'Line Manager',
      phone: manager.lineManagerPhone,
      role: 'Line Manager',
      color: 'bg-green-600',
    },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
        <CardTitle className="text-[#27BEEF]">My Manager</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {managers.map((mgr, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow bg-white">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`${mgr.color} text-white`}>
                  {mgr.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">{mgr.name}</p>
                <p className="text-xs text-gray-500">{mgr.designation}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{mgr.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
