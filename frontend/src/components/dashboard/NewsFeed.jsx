// NewsFeed.jsx
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Newspaper } from "lucide-react";

// The component still accepts the 'news' object as a prop
const NewsFeed = ({ news }) => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // CORRECTED: Extract the 'top_headlines' array from the news prop.
  // Provides a safe default empty array to prevent crashes.
  const headlines = news?.top_headlines || [];

  useEffect(() => {
    // CORRECTED: Use the 'headlines' array for logic
    if (!headlines.length || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // CORRECTED: Use the 'headlines' array for logic
        const nextIndex = (prevIndex + 1) % headlines.length;

        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: nextIndex * 80, // each card ~80px tall
            behavior: "smooth",
          });
        }

        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [headlines.length, isPaused]); // CORRECTED: Dependency is on the array's length

  return (
    <div
      className="bg-[#1a2635]/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:border-white/20 transition-transform hover:scale-[1.01]"
      onClick={() => setIsPaused(!isPaused)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-50 flex items-center">
            <Newspaper className="h-5 w-5 mr-2 text-blue-400" />
            News Feed
          </h2>
          <div className="text-xs text-gray-400 bg-[#0d141c]/50 py-1 px-2 rounded-md">
            {isPaused ? "Click to resume" : "Click to pause"}
          </div>
        </div>

        {/* News list */}
        <div className="relative h-[240px] overflow-hidden">
          <div
            ref={scrollRef}
            className="space-y-4 overflow-y-auto h-full scrollbar-hide"
          >
            {/* CORRECTED: Map over the 'headlines' array */}
            {headlines.map((item, index) => (
              <div
                key={item._id || index} // Use a unique ID from the data if available
                className={`p-3 rounded-lg transition-all ${
                  currentIndex === index
                    ? "bg-[#0d141c]/70 border-l-2 border-blue-500"
                    : "hover:bg-[#0d141c]/50"
                }`}
              >
                <h3 className="font-medium text-gray-100 mb-1">{item.title}</h3>
                {/* CORRECTED: Format the 'publishedAt' date for display */}
                <p className="text-xs text-gray-400">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1a2635] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

// CORRECTED: PropTypes now validate the structure of the 'news' object
NewsFeed.propTypes = {
  news: PropTypes.shape({
    sentiment_7d: PropTypes.number,
    n_articles_7d: PropTypes.number,
    neg_event_spike: PropTypes.bool,
    top_headlines: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        publishedAt: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        compound: PropTypes.number,
      })
    ),
  }),
};

export default NewsFeed;
