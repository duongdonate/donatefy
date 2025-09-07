import React, { useState, useRef, useEffect, useTransition } from "react";
import { Search, X } from "lucide-react";

const TextFeild = ({ placeholder = "Nhập...", label, length, helperText }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    if (length && text.length > length) {
      setError(true);
    } else {
      setError(false);
    }
  }, [text]);

  return (
    <div className="flex flex-col justify-center items-start">
      {label && (
        <label className="ml-1 mb-1 text-xs font-medium text-card-foreground">
          {label}
        </label>
      )}
      <div className="w-full flex relative items-center border space-x-1 px-4 py-2 border-transparent rounded-lg overflow-hidden bg-input shadow-md focus-within:border-primary">
        <input
          type="text"
          required
          placeholder={placeholder}
          value={text}
          onChange={handleChange}
          className="relative flex-1 text-sm bg-input outline-none pr-3 dark:placeholder-muted-foreground focus:ring-0 focus:border-transparent"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="absolute right-2 rounded-full mx-2 p-0.5
                text-muted-foreground hover:bg-muted-foreground hover:text-muted transition-color"
          >
            <X size={12} />
          </button>
        )}
      </div>
      {length &&
        (error ? (
          <span className="w-full text-right text-xs text-red-500 mt-1">
            {text.length}/{length}
          </span>
        ) : (
          <span className="w-full text-right text-xs text-muted-foreground mt-1">
            {text.length}/{length}
          </span>
        ))}
    </div>
  );
};

export default TextFeild;
