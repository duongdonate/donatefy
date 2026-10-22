import { AnimatePresence } from "framer-motion";

import HomeButton from "../components/HomeButton.jsx";
import Logo from "../components/Logo.jsx";
import SearchBar from "../components/SearchBar/SearchBar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle.jsx";

import { useSelector } from "react-redux";
import { getIsShowQueue } from "../app/selectors/";
import SongQueue from "../components/SongQueue/";
import AvatarButton from "../components/AvatarButton";
import LogoutButton from "../components/LogoutButton.jsx";

function DefaultLayout({ children }) {
  // Redux
  const showQueue = useSelector(getIsShowQueue);

  return (
    <div className="w-screen h-full bg-background grid grid-cols-10 grid-rows-8 gap-3">
      {/* Logo */}
      <div className="px-4 flex justify-start items-center col-span-3">
        <Logo />
      </div>
      {/* HeaderBar */}
      <div className="col-span-4 flex items-center justify-center space-x-3">
        <SearchBar placeholder="Tìm kiếm nhạc..." />
        <HomeButton />
      </div>
      {/* Profile & Setting */}
      <div className="px-4 flex justify-end items-center space-x-5 col-span-3">
        <ThemeToggle />
        <LogoutButton />
        <AvatarButton />
      </div>
      {/* Main Content */}
      <div
        className="col-span-10 row-span-7 row-start-2 pt-2
      bg-background-hover flex justify-start items-start overflow-hidden gap-2"
      >
        <Sidebar />
        {children}
        <AnimatePresence>{showQueue && <SongQueue />}</AnimatePresence>
      </div>
    </div>
  );
}

export default DefaultLayout;
