import { useState, useEffect, useRef } from 'react';
import { Check, Loader2, Camera, Upload } from 'lucide-react';
import { baseUrl } from '../../App';
import { jwtDecode } from 'jwt-decode';
import UserProfilePic from "../../assets/pighaljaayega.jpg"

interface UserData {
  fullName: string;
  mobileNumber: string;
  aadharNumber: string;
  isAadharVerified: boolean;
  photo: string | null;
}

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    mobileNumber: '',
    aadharNumber: '',
    isAadharVerified: false,
    photo: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("accessToken");
  const decoded = token ? (jwtDecode(token) as any) : null;
  console.log(decoded)

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken")
      const response = await await fetch(`${baseUrl}/api/me`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data = await response.json();
      setUserData(prev => ({
        ...prev,
        fullName: data.first_name + " " + data.last_name || '',
        mobileNumber: data.phone_number || '',
        aadharNumber: data.aadhar || '',
        isAadharVerified: data.isAadharVerified || false,
        photo: UserProfilePic ||`${baseUrl}${data.photo}`
      }));      
      setPhotoPreview( UserProfilePic || `${baseUrl}${data.photo}`);
      console.log(`${baseUrl}${data.photo}`)
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (name === 'aadharNumber' && userData.isAadharVerified) {
      setUserData(prev => ({ ...prev, isAadharVerified: false }));
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsDirty(true);
    }
  };

  const verifyAadhar = async () => {
    try {
      setIsVerifying(true);
      const formData = new FormData();
      formData.append('aadharNumber', userData.aadharNumber);

      const response = await fetch(`${baseUrl}/api/verify/aadhar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Aadhar verification failed');

      setUserData(prev => ({ ...prev, isAadharVerified: true }));
    } catch (err) {
      setError('Aadhar verification failed');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      const first_name = userData.fullName.split(" ")[0]
      const last_name = userData.fullName.split(" ")[1]

      // Append text data
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('phone_number', userData.mobileNumber);
      formData.append('aadharNumber', userData.aadharNumber);
      formData.append('isAadharVerified', userData.isAadharVerified.toString());

      // Append photo if there's a new one
      if (fileInputRef.current?.files?.[0]) {
        formData.append('photo', fileInputRef.current.files[0]);
      }

      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch(`${baseUrl}/api/users/${decoded?.id}/`, {
        method: 'PATCH',
        body: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setIsDirty(false);
      // Refresh user data to get updated photo URL from server
      await fetchUserData();
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !userData.fullName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {/* Profile Photo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div 
                className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handlePhotoClick}
              >
                {photoPreview || userData.photo ? (
                  <img
                    src={photoPreview || userData.photo || ''}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <button 
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
                aria-label="Change photo"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={userData.fullName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={userData.mobileNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700">
                Aadhar Number
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  value={userData.aadharNumber}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {userData.isAadharVerified ? (
                  <div className="px-3 py-2 bg-green-50 border border-l-0 border-gray-300 rounded-r-md">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                ) : (
                  <button
                    onClick={verifyAadhar}
                    disabled={isVerifying || !userData.aadharNumber}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    {isVerifying ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={updateProfile}
                disabled={!isDirty || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;