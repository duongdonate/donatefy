import { forwardRef } from "react";

const Container = forwardRef(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="flex-1 h-full bg-background rounded-lg flex-row space-y-10 overflow-auto"
    >
      {children}
      <div className="flex-1 h-[60rem] w-full"></div>
    </div>
  );
});

export default Container;
