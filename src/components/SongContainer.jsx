function SongContainer({ children }) {
  return (
    <div className="flex-1 h-full bg-background rounded-lg px-4 pt-4 pb-20 flex-row space-y-10 overflow-auto">
      {children}
      <div className="flex-1 h-[50rem] w-full"></div>
    </div>
  );
}

export default SongContainer;
