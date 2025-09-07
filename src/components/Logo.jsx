import { memo } from "react";
import MatchaChasen from "../assets/matcha_chasen.svg?react";

function Logo() {
  return (
    <div className="mr-5 flex justify-start items-center pointer-events-none">
      <MatchaChasen className="w-20 h-20" />
      <h1 className="mt-2 flex flex-col justify-start items-start">
        <span className="text-xl font-bold text-primary">Matcha</span>
        <span className="text-xl font-bold text-primary">Cha-Cha-Cha</span>
      </h1>
    </div>
  );
}

export default memo(Logo);
