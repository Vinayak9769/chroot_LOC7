import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, X, Edit2 } from 'lucide-react';
import { baseUrl } from '../../App';
import { jwtDecode } from 'jwt-decode';

interface EmergencyContact {
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmergencyContact>({
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const token = localStorage.getItem("accessToken");
  const decoded = token ? (jwtDecode(token) as any) : null;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/me`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '444',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch contacts');
      
      const data = await response.json();
      const emergency_contacts = [
        {
          emergency_contact_name: data.emergency_contact_name, 
          emergency_contact_phone: data.emergency_contact_phone
        }
      ];
      setContacts(emergency_contacts || []);
    } catch (err) {
      setError('Failed to load emergency contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!decoded) {
        setError('Invalid token');
        return;
      }
      const url = `${baseUrl}/api/users/${decoded.id}/`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save contact');

      await fetchContacts();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save contact');
      console.error(err);
    }
  };

  const handleEditClick = (contact: EmergencyContact) => {
    setIsEditing(true);
    setFormData(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ emergency_contact_name: '', emergency_contact_phone: '' });
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Emergency Contacts</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 
            flex items-center gap-2 transition-colors duration-200"
        >
          <Plus size={20} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full mx-10 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact_name: e.target.value
                  })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact_phone: e.target.value
                  })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded 
                  hover:bg-indigo-700 transition-colors duration-200"
              >
                {isEditing ? 'Save Changes' : 'Add Contact'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div 
            key={index}
            className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center
              hover:shadow-lg transition-shadow duration-200"
          >
            <div>
              <h3 className="font-semibold">{contact.emergency_contact_name}</h3>
              <button
                onClick={() => handlePhoneCall(contact.emergency_contact_phone)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2
                  transition-colors duration-200"
              >
                <Phone size={16} />
                <span className="underline">{contact.emergency_contact_phone}</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleEditClick(contact)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <Edit2 size={20} />
              </button>
              <button 
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            No emergency contacts added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;