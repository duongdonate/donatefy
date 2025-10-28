import SongContainer from "../components/SongContainer";
import { useAuth } from "../contexts/AuthContext";

const HomePage = ({ user }) => {
  return (
    <SongContainer className="transition-all">
      <h1 className="text-xl font-semibold text-card-foreground">
        {`Hello, ${user?.username}!`}
      </h1>
    </SongContainer>
  );
};

export default HomePage;
