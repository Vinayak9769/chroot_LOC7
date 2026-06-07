import React, { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Camera,
  Video,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../../../App";

interface ReportedBy {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_officer: boolean;
  is_admin: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  phone_number: string | null;
  aadhar: string | null;
}

interface IncidentDetailsData {
  id: number;
  title: string;
  description: string;
  location: string;
  incident_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  reported_by: ReportedBy;
  coordinates: [number, number];
  media: Array<{ type: "photo" | "video"; url: string }>;
}

const IncidentDetails: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [incidentDetailsData, setIncidentDetailsData] =
    useState<IncidentDetailsData | null>(null);

  const { incidentId } = useParams<{ incidentId: string }>(); 

  const fetchData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${baseUrl}/api/cases/incidents/${incidentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

  
    const transformedData: IncidentDetailsData = {
      ...data,
      media: data.media || [], 
    };

    setIncidentDetailsData(transformedData);
  };

  useEffect(() => {
    fetchData();
  }, [incidentId]); 

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  if (!incidentDetailsData) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Incident Report #{incidentDetailsData.id}
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Incident Details</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{formatDate(incidentDetailsData.created_at)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>{formatTime(incidentDetailsData.created_at)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{incidentDetailsData.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{incidentDetailsData.incident_type}</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Additional Information
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Title:</strong> {incidentDetailsData.title}
              </p>
              <p>
                <strong>Status:</strong> {incidentDetailsData.status}
              </p>
              <p>
                <strong>Description:</strong> {incidentDetailsData.description}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                <a
                  className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                  href={`https://www.google.com/maps?q=${incidentDetailsData.coordinates.join(
                    ","
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click to view location on Google Maps
                </a>
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {formatDate(incidentDetailsData.updated_at)}{" "}
                {formatTime(incidentDetailsData.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Reported By</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="flex items-center">
              <User className="w-5 h-5 mr-2" />{" "}
              {incidentDetailsData.reported_by.first_name}{" "}
              {incidentDetailsData.reported_by.last_name}
            </p>
            <p className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />{" "}
              {incidentDetailsData.reported_by.email}
            </p>
            <p>
              <strong>Username:</strong>{" "}
              {incidentDetailsData.reported_by.username}
            </p>
            <p>
              <strong>Officer:</strong>{" "}
              {incidentDetailsData.reported_by.is_officer ? "Yes" : "No"}
            </p>
            <p>
              <strong>Admin:</strong>{" "}
              {incidentDetailsData.reported_by.is_admin ? "Yes" : "No"}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Emergency Contact:</strong>{" "}
              {incidentDetailsData.reported_by.emergency_contact_name}
            </p>
            <p className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />{" "}
              {incidentDetailsData.reported_by.emergency_contact_phone}
            </p>
            {incidentDetailsData.reported_by.phone_number && (
              <p>
                <strong>Phone:</strong>{" "}
                {incidentDetailsData.reported_by.phone_number}
              </p>
            )}
            {incidentDetailsData.reported_by.aadhar && (
              <p>
                <strong>Aadhar:</strong>{" "}
                {incidentDetailsData.reported_by.aadhar}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Media</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <img
            src={incidentDetailsData.media?.[0]?.url || ""}
            alt="Incident media"
            className="max-w-full max-h-full"
          />
        </div>
      </div>
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-3xl max-h-full p-4">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetails;
