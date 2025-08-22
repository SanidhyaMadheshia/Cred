// Footer.jsx
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#1a2635]/30 border-t border-white/10 text-white mt-10">
      {/* Height is controlled by py-8 (padding top+bottom). 
          Increase/decrease py-8 to make footer taller or smaller. */}
      <div className="container mx-auto text-center py-8">
        {/* Top line */}
        <p className="text-gray-400 mb-4 text-sm">
          © 2025 CredLens. All rights reserved.
        </p>

        {/* Social links */}
        <div className="flex justify-center space-x-6">
          <a
            href="#"
            className="text-gray-400 hover:text-[#248bf3] transition transform hover:scale-110"
          >
            <FaTwitter size={22} />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-pink-500 transition transform hover:scale-110"
          >
            <FaInstagram size={22} />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-blue-600 transition transform hover:scale-110"
          >
            <FaFacebook size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
