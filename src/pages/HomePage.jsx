import SongContainer from "../components/SongContainer";

const HomePage = ({ currentSong, songs }) => {
  return (
    <SongContainer
      currentSong={currentSong}
      songs={songs}
      className="transition-all"
    />
  );
};

export default HomePage;
