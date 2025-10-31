import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface LeaveBalanceCardProps {
  leaveBalance: {
    CL: { taken: number; total: number };
    SL: { taken: number; total: number };
    EL: { taken: number; total: number };
    LWP: { taken: number; total: number };
  } | null;
}

export function LeaveBalanceCard({ leaveBalance }: LeaveBalanceCardProps) {
  if (!leaveBalance) {
    return null;
  }

  const leaveTypes = [
    { code: 'CL', name: 'Casual Leave', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { code: 'SL', name: 'Sick Leave', color: 'text-red-600', bgColor: 'bg-red-100' },
    { code: 'EL', name: 'Earn Leave', color: 'text-green-600', bgColor: 'bg-green-100' },
    { code: 'LWP', name: 'Leave Without Pay', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
        <CardTitle className="text-[#F4A247]">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {leaveTypes.map((type) => {
            const balance = leaveBalance[type.code as keyof typeof leaveBalance];
            const remaining = balance.total === -1 ? 'Unlimited' : balance.total - balance.taken;
            const percentage = balance.total === -1 ? 0 : (balance.taken / balance.total) * 100;

            return (
              <div key={type.code} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{type.name}</p>
                    <p className="text-xs text-gray-500">{type.code}</p>
                  </div>
                  <Badge className={type.bgColor + ' ' + type.color}>
                    {balance.taken} / {balance.total === -1 ? '∞' : balance.total}
                  </Badge>
                </div>
                {balance.total !== -1 && (
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-right text-gray-500">
                      {remaining} days remaining
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
