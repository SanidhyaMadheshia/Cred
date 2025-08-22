import PropTypes from "prop-types";

const RiskRating = ({ rating, factors = [] }) => {
  // Determine color and styling based on rating
  const getRatingInfo = (rating) => {
    switch (rating) {
      case "Low_Risk":
      case "Low Risk":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/10",
        };
      case "High_Risk":
      case "High Risk":
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/10",
        };
      case "Highest_Risk":
      case "Highest Risk":
        return {
          color: "text-red-600",
          bgColor: "bg-red-600/10",
        };
      case "Medium_Risk":
      case "Medium Risk":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
        };
      default:
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
        };
    }
  };

  const { color } = getRatingInfo(rating);
  
  // Format rating for display (replace underscores with spaces)
  const displayRating = rating ? rating.replace(/_/g, ' ') : 'Unknown';

  return (
    <div className="bg-[#1a2635]/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:border-white/20 transition-transform hover:scale-[1.01]">
      <div className="p-5">
        <h2 className="text-2xl font-bold tracking-wide text-blue-50 mb-4">
          Risk Rating
        </h2>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          {/* Rating section */}
          <div className="flex items-center mb-4 md:mb-0  ml-2">
            <div>
              <div className="text-md text-gray-400 mb-1">Predicted Rating</div>
              <div className={`text-3xl tracking-wide font-bold ${color}`}>
                {displayRating}
              </div>
            </div>
          </div>

          {/* Top Factors */}
          <div className="bg-[#0d141c] rounded-lg p-4 w-full md:w-auto mr-10">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Top Factors
            </h3>
            <ul className="space-y-2">
              {factors.map((factor, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-md text-gray-300 capitalize break-words hover:text-white transition transform hover:scale-110">
                    {factor.Feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

RiskRating.propTypes = {
  rating: PropTypes.string.isRequired,
  factors: PropTypes.arrayOf(
    PropTypes.shape({
      Feature: PropTypes.string.isRequired,
    })
  ),
};

export default RiskRating;
