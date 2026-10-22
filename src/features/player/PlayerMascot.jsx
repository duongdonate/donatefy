// Matcappa trên Now Playing: tư thế theo trạng thái phát, bấm vào thì nói một câu
import { useEffect, useState } from "react";
import MascotSpeech from "../../mascot/MascotSpeech";
import Matcappa from "../../mascot/Matcappa";
import { PLAYER_LINES, pickLine } from "../../mascot/lines";
import { mascotFor } from "./playerMath";

export default function PlayerMascot({ hasSong, isPlaying, greet = false, className = "" }) {
  const { pose, propeller } = mascotFor({ hasSong, isPlaying });
  const lines = PLAYER_LINES[!hasSong ? "empty" : isPlaying ? "playing" : "paused"];
  const [say, setSay] = useState({ i: -1, show: false });

  // Màn trống: chào ngay câu hướng dẫn đầu tiên
  useEffect(() => {
    if (greet) setSay({ i: 0, show: true });
  }, [greet]);

  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <Matcappa
        pose={pose}
        propeller={propeller}
        size={120}
        label="Matcappa"
        talking={say.show}
        onClick={() => setSay((s) => ({ i: pickLine(lines, s.i), show: true }))}
      />
      <MascotSpeech text={lines[say.i]} show={say.show} onHide={() => setSay((s) => ({ ...s, show: false }))} className="mb-16" />
    </div>
  );
}
