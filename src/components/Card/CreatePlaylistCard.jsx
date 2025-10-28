import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import playlistService from "../../services/api/playlistService";

import { useDispatch } from "react-redux";
import { addPlaylist } from "../../app/slices/playlistSlice";

import TextFeild from "../Inputs/TextFeild";
import usePopup from "../../hooks/usePopup";

function CreatePlaylistCard() {
  const [errorPlaylistName, setErrorPlaylistName] = useState({
    state: false,
    message: "",
  });
  const playlistNameRef = useRef(null);
  const lengthPlaylistName = 25;
  const dispatch = useDispatch();
  const { closePopup } = usePopup();

  const validatePlaylistName = (name) => {
    if (name.length > lengthPlaylistName) {
      setErrorPlaylistName({
        state: true,
        message: "> 25",
      });
    } else if (name.trim().length === 0) {
      setErrorPlaylistName({
        state: true,
        message: "Playlist name is required",
      });
    } else {
      setErrorPlaylistName({ state: false, message: "" });
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    const name = playlistNameRef.current.value;
    validatePlaylistName(name);
    if (errorPlaylistName.state) return;
    else {
      try {
        const data = await playlistService.create({ name });
        dispatch(addPlaylist(data));
        closePopup();
        console.log("Playlist created:", data);
      } catch (error) {
        console.error("Error creating playlist:", error);
      }
    }
  };

  return (
    <form className="w-64 flex flex-col justify-center items-center gap-5">
      <h2 className="w-full text-2xl font-bold text-center">
        Create New Playlist
      </h2>
      <div className="w-full flex flex-col justify-center items-center space-y-2">
        <TextFeild
          required
          placeholder="Playlist Name"
          ref={playlistNameRef}
          length={lengthPlaylistName}
          error={errorPlaylistName.state}
          helperText={errorPlaylistName.message}
          onChange={(e) => validatePlaylistName(e.target.value)}
        />
      </div>
      <button
        type="submit"
        onClick={(e) => handleCreatePlaylist(e)}
        className="w-full font-semibold bg-primary text-primary-foreground p-2 rounded hover:scale-95 shadow-xl transition"
      >
        Create Playlist
      </button>
    </form>
  );
}

export default CreatePlaylistCard;
