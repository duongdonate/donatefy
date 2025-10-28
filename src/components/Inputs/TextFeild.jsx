import { useState, useEffect, forwardRef } from "react";
import { X } from "lucide-react";

const TextFeild = forwardRef(
  (
    { placeholder, required, label, length, helperText, error, onChange },
    ref
  ) => {
    const [text, setText] = useState("");
    const [textLabel, setTextLabel] = useState("text-muted-foreground");
    const [textHelperText, setTextHelperText] = useState(
      "text-muted-foreground"
    );

    const handleChange = (e) => {
      setText(e.target.value);
      onChange && onChange(e);
    };

    useEffect(() => {
      if (error) {
        setTextLabel("text-destructive");
        setTextHelperText("text-destructive");
      } else {
        setTextLabel("text-muted-foreground");
        setTextHelperText("text-muted-foreground");
      }
    }, [error]);

    return (
      <div className="w-full flex flex-col justify-center items-center">
        {label && (
          <label className={`w-full text-sm font-medium mb-1 ${textLabel}`}>
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}
        <div className="w-full flex relative items-center border space-x-1 px-4 py-2 border-transparent rounded-lg overflow-hidden bg-input shadow-md focus-within:border-primary">
          <input
            ref={ref}
            type="text"
            required={required}
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
        <div
          className={`w-full flex flex-row-reverse justify-between items-center ${textHelperText}`}
        >
          {length && (
            <span className="text-right text-xs">
              {text.length}/{length}
            </span>
          )}
          {helperText && (
            <span className="text-left text-xs">{helperText}</span>
          )}
        </div>
      </div>
    );
  }
);

export default TextFeild;
