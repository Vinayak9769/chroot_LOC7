import { BarChart, MapPin, Brain, AlertTriangle } from "lucide-react";

interface PredictiveInsight {
  confidence: number;
  pattern_match: string;
  similar_cases: string[];
  suggested_actions: string[];
  risk_factors: {
    level: "low" | "medium" | "high";
    reasons: string[];
  };
  geographical_hotspots: {
    coordinates: [number, number];
    incident_count: number;
    time_pattern: string;
  }[];
}

interface CaseData {
  id: number;
  caseNumber: string;
  created_at: string;
  incident_type: string;
  location: string;
  coordinates: [number, number];
  description: string;
  estimated_loss?: string;
  accused?: Record<string, any>;
  officer?: Record<string, any>;
  reported_by?: Record<string, any>;
}

interface SmartCaseAnalyticsProps {
  caseData?: CaseData;
  predictiveInsights?: PredictiveInsight;
}

export function SmartCaseAnalytics({
  caseData = {
    id: 1,
    caseNumber: "CASE-2024-001",
    created_at: "2024-07-27T10:15:00Z",
    incident_type: "Burglary",
    location: "Diamond District Mall, Andheri East",
    coordinates: [19.1292, 72.9131],
    description:
      "Breaking and entering reported at local jewelry store. Multiple items stolen including precious gems and gold jewelry. Security system was disabled prior to entry.",
    estimated_loss: "₹25,00,000",
    accused: {
      name: "Govind Singh",
      age: 35,
      address: "123 Main St, Mumbai",
      status: "At Large",
    },
    officer: {
      name: "Inspector Raj Kumar",
      badge: "MH-1234",
      department: "Criminal Investigation Unit",
    },
    reported_by: {
      id: 2,
      first_name: "New",
      last_name: "User",
      username: "vinayak9769",
      email: "vinayak97696@gmail.com",
      phone_number: null,
      emergency_contact_name: "Jane Doe",
      emergency_contact_phone: "9324889443",
      is_admin: false,
      is_officer: true,
    },
  },
  predictiveInsights = {
    confidence: 87,
    pattern_match:
      "This case shows strong similarities with a series of organized jewelry store robberies in the Western suburbs over the last 6 months",
    similar_cases: ["2024-156", "2024-098", "2023-892"],
    suggested_actions: [
      "Deploy plainclothes officers in identified hotspot areas between 02:00-04:00",
      "Alert all jewelry stores in Andheri-Juhu belt about the MO",
      "Cross-reference fingerprints with cases 2024-156 and 2024-098",
      "Increase surveillance on known jewelry fences in Zaveri Bazaar",
    ],
    risk_factors: {
      level: "high",
      reasons: [
        "Professional equipment used indicates organized crime",
        "Pattern matches with 3 unsolved cases",
        "Escalating value of targets",
        "Advanced security system breach capability",
      ],
    },
    geographical_hotspots: [
      {
        coordinates: [19.1178, 72.8478],
        incident_count: 4,
        time_pattern: "02:00-04:00 AM, Weekdays",
      },
      {
        coordinates: [19.1298, 72.8257],
        incident_count: 3,
        time_pattern: "01:00-03:00 AM, Weekends",
      },
    ],
  },
}: SmartCaseAnalyticsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Smart Case Analysis
          </h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            {predictiveInsights.confidence}% Confidence
          </span>
        </div>

        {/* Pattern Recognition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-500" />
              Pattern Match
            </h3>
            <p className="text-gray-600">{predictiveInsights.pattern_match}</p>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Similar Cases:</h4>
              <ul className="space-y-1">
                {predictiveInsights.similar_cases.map((caseNum, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    Case #{caseNum}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Risk Assessment
            </h3>
            <div
              className={`
              px-3 py-2 rounded-lg mb-3
              ${
                predictiveInsights.risk_factors.level === "high"
                  ? "bg-red-100 text-red-800"
                  : predictiveInsights.risk_factors.level === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }
            `}
            >
              {predictiveInsights.risk_factors.level.toUpperCase()} RISK
            </div>
            <ul className="space-y-1">
              {predictiveInsights.risk_factors.reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <span className="min-w-[8px] h-2 rounded-full bg-gray-400 mt-2" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictiveInsights.suggested_actions.map((action, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm">{action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographical Analysis */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            Crime Hotspots
          </h3>
          <div className="space-y-3">
            {predictiveInsights.geographical_hotspots.map((hotspot, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl font-bold text-red-500">
                  #{idx + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Location: {hotspot.coordinates.join(", ")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Incidents: {hotspot.incident_count}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pattern: {hotspot.time_pattern}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
