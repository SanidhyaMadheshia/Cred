import PropTypes from "prop-types";
import { Calendar, Users, MapPin } from "lucide-react";

const CompanyProfile = ({ company = {} }) => {
  const {
    CompanyName = "",
    Sector = "",
    founded = "",
    employees = "",
    headquarters = "",
  } = company;

  return (
    <div className="bg-[#1a2635]/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:border-white/20 transition-transform hover:scale-[1.01]">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-blue-50 mb-4">
          Company Profile
        </h2>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">
            {CompanyName || "—"}
          </h1>
          <div className="flex items-center mt-1">
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-400 text-sm">{Sector || "—"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center">
            <div className="bg-[#0d141c]/50 p-2 rounded mr-3">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Founded</p>
              <p className="text-sm font-medium">{founded || "—"}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-[#0d141c]/50 p-2 rounded mr-3">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Employees</p>
              <p className="text-sm font-medium">{employees || "—"}</p>
            </div>
          </div>

          <div className="flex items-center col-span-1 md:col-span-2">
            <div className="bg-[#0d141c]/50 p-2 rounded mr-3">
              <MapPin className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Headquarters</p>
              <p className="text-sm font-medium">{headquarters || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CompanyProfile.propTypes = {
  company: PropTypes.shape({
    name: PropTypes.string,
    symbol: PropTypes.string,
    sector: PropTypes.string,
    founded: PropTypes.string,
    employees: PropTypes.string,
    headquarters: PropTypes.string,
  }),
};

export default CompanyProfile;
