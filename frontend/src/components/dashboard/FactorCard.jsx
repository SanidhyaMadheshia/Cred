import PropTypes from "prop-types";

const FactorCard = ({ name, contribution, description, variant = 0 }) => {
  // Different styling variants
  const variants = [
    {
      bgGradient: "from-blue-600/20 to-blue-400/5",
      borderColor: "border-blue-500/20",
    },
    {
      bgGradient: "from-purple-600/20 to-purple-400/5",
      borderColor: "border-purple-500/20",
    },
    {
      bgGradient: "from-teal-600/20 to-teal-400/5",
      borderColor: "border-teal-500/20",
    },
  ];

  const currentVariant = variants[variant % variants.length];

  const toCapitalize = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div
      className={`bg-[#1a2635]/80 backdrop-blur-sm rounded-xl border ${currentVariant.borderColor} shadow-lg p-4 transition-all hover:shadow-xl hover:border-white/20 h-full flex flex-col justify-between bg-gradient-to-br ${currentVariant.bgGradient} transition-transform hover:scale-[1.01]`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-2xl font-bold">{contribution}</span>
      </div>

      <div>
        <h3 className="font-medium text-2xl break-words text-gray-100 capitalize tracking-wide mb-1.5">
          {name}
        </h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
};

FactorCard.propTypes = {
  name: PropTypes.string.isRequired,
  contribution: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  variant: PropTypes.number,
};

export default FactorCard;
