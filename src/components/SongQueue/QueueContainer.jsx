import { motion } from "framer-motion";

function QueueContainer() {
  return (
    <motion.div
      initial={{ opacity: 1, width: 0 }}
      animate={{
        width: "100%",
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      }}
      exit={{ opacity: 0.5, width: 0 }}
      className="h-full bg-background text-foreground grow-0 flex flex-col rounded-lg max-w-xs w-64"
    ></motion.div>
  );
}

export default QueueContainer;
