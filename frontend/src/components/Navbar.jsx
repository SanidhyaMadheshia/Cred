import React, { useState } from "react";

export default function Navbar({ onSearch, loading = false }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== "" && !loading) {
      onSearch(query);
    }
  };

  return (
    <nav className="bg-[#0d141c] px-6 py-4 flex justify-between items-center border-b border-gray-700">
      <h1 className="text-2xl font-bold tracking-wider text-[#248bf3]">
        CredLens
      </h1>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none w-64 "
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-transform ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-[#248bf3] hover:bg-blue-600 hover:scale-[1.01]'
          }`}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
    </nav>
  );
}
