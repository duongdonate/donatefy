import React, { useState, useRef, useEffect, useTransition } from "react";
import { Search, X } from "lucide-react";
import useDebounce from "../../hooks/useDebounce"; // đường dẫn đúng của bạn nhé

const SearchBar = ({ placeholder = "Tìm kiếm...", onSearch = () => {} }) => {
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 400);

  // Gọi search khi debouncedQuery thay đổi
  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    } else {
      onSearch("");
    }
  }, [debouncedQuery, onSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full">
      <form
        className="flex items-center border space-x-1 p-1 border-gray-300 rounded-full overflow-hidden bg-white shadow-sm focus-within:border-blue-500
        dark:border-gray-600 dark:bg-gray-900 dark:focus-within:border-blue-500"
      >
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="relative flex-1 px-4 py-2 text-sm outline-none
           dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 focus:ring-0 focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full mx-2 p-0.5 
            text-muted-foreground hover:bg-muted-foreground hover:text-muted transition-color"
          >
            <X size={12} />
          </button>
        )}
        <button
          className="px-2 py-2 bg-background-hover text-foreground transition
          rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
