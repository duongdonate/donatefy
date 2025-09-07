import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

function LikedSongButton({ isExpanded }) {
  return (
    <Link to="/liked-songs">
      <button
        className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left
         hover:bg-background-hover transition-colors"
      >
        <div className="w-10 aspect-square bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded flex items-center justify-center shrink-0">
          <Heart size={16} />
        </div>
        {isExpanded && (
          <span className="text-foreground font-medium shrink-0">
            Liked Songs
          </span>
        )}
      </button>
    </Link>
  );
}

export default LikedSongButton;
