import TextFeild from "../TextFeild";

function CreatePlaylistCard() {
  return (
    <form className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Create New Playlist</h2>
      <TextFeild label="Playlist Name" length={25} />
      <textarea
        placeholder="Description"
        className="p-2 border border-gray-300 rounded"
        rows="4"
      ></textarea>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
      >
        Create Playlist
      </button>
    </form>
  );
}

export default CreatePlaylistCard;
