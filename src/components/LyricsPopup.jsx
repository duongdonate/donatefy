import React from 'react';
import { X, Music } from 'lucide-react';

const LyricsPopup = ({ 
  showLyrics, 
  setShowLyrics, 
  currentSong 
}) => {
  if (!showLyrics) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Lyrics</h2>
          <button
            onClick={() => setShowLyrics(false)}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Song Info */}
        {currentSong && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <img 
                src={currentSong.cover} 
                alt={currentSong.title}
                className="w-16 h-16 rounded object-cover"
              />
              <div>
                <h3 className="font-bold text-white">{currentSong.title}</h3>
                <p className="text-gray-400">{currentSong.artist}</p>
                <p className="text-sm text-gray-500">{currentSong.album}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lyrics Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentSong?.lyrics ? (
            <div className="space-y-4">
              {currentSong.lyrics.split('\n').map((line, index) => (
                <p key={index} className="text-white leading-relaxed">
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Music className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400">No lyrics available</p>
              <p className="text-sm text-gray-500 mt-2">
                Lyrics for this song are not available yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsPopup;