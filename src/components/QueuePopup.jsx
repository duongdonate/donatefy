import React from 'react';
import { X, Play, Pause, MoreHorizontal } from 'lucide-react';

const QueuePopup = ({ 
  showQueue, 
  setShowQueue, 
  queue, 
  currentSong, 
  onSongSelect,
  isPlaying,
  onPlayPause
}) => {
  if (!showQueue) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Queue</h2>
          <button
            onClick={() => setShowQueue(false)}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Song */}
        {currentSong && (
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Now Playing</h3>
            <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
              <img 
                src={currentSong.cover} 
                alt={currentSong.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{currentSong.title}</h4>
                <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
              </div>
              <button
                onClick={onPlayPause}
                className="text-green-500 hover:text-green-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Next Up</h3>
          {queue.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No songs in queue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => onSongSelect(song)}
                >
                  <span className="text-sm text-gray-400 w-6 text-center">
                    {index + 1}
                  </span>
                  <img 
                    src={song.cover} 
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{song.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  </div>
                  <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueuePopup;