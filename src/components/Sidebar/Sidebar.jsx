import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, memo } from "react";
import { Library, ChevronLeft, ChevronRight } from "lucide-react";
import { mockPlaylists } from "../../mock";
import { Link } from "react-router-dom";
import LikedSongButton from "./LikedSongButton";
import CreatePlaylistButton from "./CreatePlaylistButton";
import PlaylistButton from "./PlaylistButton";
// Redux
import { useDispatch, useSelector } from "react-redux";
import { getAllPlaylists } from "../../app/selectors";
import playlistService from "../../services/api/playlistService";
import { setAllPlaylists } from "../../app/slices/playlistSlice";

const Sidebar = () => {
  const [width, setWidth] = useState(352); // Initial width of the sidebar
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  useEffect(() => {
    if (isExpanded) {
      setWidth(352);
      // Expanded width
    } else {
      setWidth(104);
    } // Collapsed width
  }, [isExpanded]);

  // Redux
  const playlists = useSelector(getAllPlaylists);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data } = await playlistService.getAll();
        console.log("Fetched playlists:", data);

        dispatch(setAllPlaylists(data));
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    fetchPlaylists();
    return () => {};
  }, [playlists.length]);

  return (
    <motion.aside
      initial={{ width: width }}
      animate={{
        width: width,
        transition: {
          type: "spring",
          stiffness: 250,
          damping: 20,
          bounce: 0.5,
        },
      }}
      className="h-full bg-background text-foreground grow-0 flex flex-col rounded-lg max-w-xs"
    >
      {/* Toggle Sidebar */}
      <div className="px-4 py-2 relative">
        <button
          key={"iconLib"}
          onClick={toggleSidebar}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
            text-foreground"
        >
          <Library size={28} strokeWidth={3} className="shrink-0" />
          {isExpanded && (
            <span className="font-medium shrink-0">Your Library</span>
          )}

          {/* Hover icon */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="hover-icon"
                initial={{ opacity: 0, x: isExpanded ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isExpanded ? -10 : 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-4"
              >
                {isExpanded ? (
                  <ChevronLeft size={18} className="text-gray-400" />
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border"></div>

      {/* Playlists */}
      <div className="p-4 flex-1">
        <div className="space-y-1">
          {/* Liked Songs */}
          <LikedSongButton isExpanded={isExpanded} />

          {/* Create Playlist */}
          <CreatePlaylistButton isExpanded={isExpanded} />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-sm font-medium text-foreground mt-4 px-4"
            >
              My Playlists
            </motion.h3>
          )}
        </AnimatePresence>

        {/* User Playlists */}
        <div className="mt-6 overflow-y-auto max-h-80">
          <div className="space-y-2">
            {playlists?.map((playlist) => (
              <Link key={playlist._id} to={`/playlist/${playlist._id}`}>
                <PlaylistButton
                  key={playlist._id}
                  playlist={playlist}
                  isExpanded={isExpanded}
                />
              </Link>
            ))}
            <div className="h-28"></div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default memo(Sidebar);
