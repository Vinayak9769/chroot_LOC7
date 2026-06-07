import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { baseUrl } from '../../App';
import { Loader } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface PoliceProfile {
  fullName: string;
  rank: string;
  badgeNumber: string;
  division: string;
  jurisdiction: string;
  mobileNo: string;
  email: string;
  photo: string;
}

const divisions = [
  "Traffic Division",
  "Crime Branch",
  "Cyber Cell",
  "Special Branch",
  "Anti-Terrorism Squad"
];

const PoliceProfile = () => {
  const [profile, setProfile] = useState<PoliceProfile>({
    fullName: '',
    rank: '',
    badgeNumber: '',
    division: '',
    jurisdiction: '',
    mobileNo: '',
    email: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const decoded = jwtDecode(localStorage.getItem("accessToken") || "") as any;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/cases/officers/${decoded?.id}`, {
        'method': 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'ngrok-skip-browser-warning': '444'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfile(prev => ({
        ...prev,
        fullName: data.user.first_name + " " + data.user.last_name || '',
        rank: data.rank,
        badgeNumber: data.badge_number,
        division: data.unit,
        jurisdiction: data.station_name,
        mobileNo: data.user.phone_number || '',
        email: data.user.email,
        photo: data.user.photo
      }));
      setPhotoPreview(data.user.photo);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfile({ ...profile, photo: file.name });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      const first_name = profile.fullName.split(" ")[0]
      const last_name = profile.fullName.split(" ")[1]

      // Append text data
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('phone_number', profile.mobileNo);
      formData.append('email', profile.email);
        
      // Append photo if there's a new one
        if (fileInputRef.current?.files?.[0]) {
            formData.append('photo', fileInputRef.current.files[0]);
        }

      const response = await fetch(`${baseUrl}/api/users/${decoded.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'ngrok-skip-browser-warning': '444'
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      alert('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
  </div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Police Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 relative mb-4">
              <img
                src={photoPreview || profile.photo || '/default-avatar.png'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-indigo-200"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rank/Designation</label>
              <input
                type="text"
                value={profile.rank}
                onChange={(e) => setProfile({...profile, rank: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Badge Number</label>
              <input
                type="text"
                value={profile.badgeNumber}
                onChange={(e) => setProfile({...profile, badgeNumber: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Division</label>
              <select
                value={profile.division}
                onChange={(e) => setProfile({...profile, division: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jurisdiction</label>
              <input
                type="text"
                value={profile.jurisdiction}
                onChange={(e) => setProfile({...profile, jurisdiction: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                value={profile.mobileNo}
                onChange={(e) => setProfile({...profile, mobileNo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PoliceProfile;