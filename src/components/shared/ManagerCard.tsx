import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ManagerCardProps {
  manager: {
    adminName?: string;
  } | null;
}

export function ManagerCard({ manager }: ManagerCardProps) {
  if (!manager || !manager.adminName) {
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

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
        <CardTitle className="text-[#27BEEF]">My Manager</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center p-6">
          <h3 className="text-xl font-semibold text-gray-800">{manager.adminName}</h3>
          <p className="text-sm text-gray-500 mt-2">Admin</p>
        </div>
      </CardContent>
    </Card>
  );
}
