import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, Mail, IdCard, BookOpen, Upload } from 'lucide-react';
import { showSuccess, showError, showLoading, closeLoading } from '../../utils/alerts';
import { projectId } from '../../utils/supabase/info';

interface ProfileTabProps {
  user: any;
  accessToken: string;
  onUpdateUser: (updatedUser: any) => void;
}

export function ProfileTab({ user, accessToken, onUpdateUser }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Updating profile...');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const studentId = formData.get('studentId') as string;
    const semester = formData.get('semester') as string;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/update-profile`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, studentId, semester }),
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Profile updated successfully!');
        onUpdateUser(data.user);
        setEditMode(false);
      } else {
        showError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      closeLoading();
      console.error('Update profile error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    setLoading(true);
    showLoading('Uploading image...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0614540f/upload-profile-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess('Profile image updated successfully!');
        onUpdateUser({ ...user, profileImage: data.imageUrl });
      } else {
        showError(data.error || 'Failed to upload image');
      }
    } catch (error) {
      closeLoading();
      console.error('Upload image error:', error);
      showError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#27BEEF] to-[#F4A247] text-white">
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 border-4 border-[#27BEEF]">
                {user?.profileImage && (
                  <AvatarImage src={user.profileImage} alt={user?.name} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-[#27BEEF] to-[#F4A247] text-white text-4xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Upload className="w-4 h-4" />
                Change Photo
              </Button>
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={user?.name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user?.email}
                      required
                    />
                  </div>

                  {user?.role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          name="studentId"
                          defaultValue={user?.studentId}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Input
                          id="semester"
                          name="semester"
                          defaultValue={user?.semester}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="bg-[#27BEEF]">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <User className="w-5 h-5 text-[#27BEEF]" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Mail className="w-5 h-5 text-[#27BEEF]" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                  </div>

                  {user?.role === 'student' && (
                    <>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <IdCard className="w-5 h-5 text-[#27BEEF]" />
                        <div>
                          <p className="text-sm text-gray-500">Student ID</p>
                          <p className="text-lg">{user?.studentId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <BookOpen className="w-5 h-5 text-[#27BEEF]" />
                        <div>
                          <p className="text-sm text-gray-500">Semester</p>
                          <p className="text-lg">{user?.semester}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-[#27BEEF]/10 to-[#F4A247]/10">
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-lg capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setEditMode(true)}
                    className="w-full bg-[#F4A247] hover:bg-[#F4A247]/90 mt-6"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
