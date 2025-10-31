import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Bell, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { showSuccess, showError } from '../../../utils/alerts';

interface NoticeBoardTabProps {
  notices: any[];
  accessToken: string;
  user: any;
  onRefresh: () => void;
}

export function NoticeBoardTab({ notices, accessToken, user, onRefresh }: NoticeBoardTabProps) {
  const handleReact = async (noticeId: string, reaction: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/react-to-notice`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ noticeId, reaction }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showSuccess('Reaction added!');
        onRefresh();
      }
    } catch (error) {
      console.error('React error:', error);
      showError('Failed to add reaction');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <CardTitle>Notice Board</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg">{notice.title}</h3>
                  <p className="text-xs text-gray-500">Posted by {notice.postedBy} on {notice.postedOn}</p>
                </div>
                <Badge>{notice.targetAudience}</Badge>
              </div>
              <p className="text-sm text-gray-700 mb-4">{notice.content}</p>
              <div className="flex items-center gap-2 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => handleReact(notice.id, 'Like')}>
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Like
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleReact(notice.id, 'Dislike')}>
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Dislike
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleReact(notice.id, 'Understood')}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Understood
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleReact(notice.id, 'Concerned')}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Concerned
                </Button>
              </div>
            </div>
          ))}
          {notices.length === 0 && (
            <p className="text-center text-gray-500 py-8">No notices available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
