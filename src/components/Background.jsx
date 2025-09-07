import { memo } from "react";

function Background({ url }) {
  if (!url)
    return <div className="absolute h-full w-full z-0 bg-[#0f2a1d] "></div>;
  return (
    <div
      className={`absolute h-full w-full z-0
        bg-[url('${url}')]
        bg-cover bg-center blur-md brightness-75 grayscale-25`}
    ></div>
  );
}

export default memo(Background);
