import React, { useState, useRef, useEffect, useTransition } from "react";
import { Search, X } from "lucide-react";
import useDebounce from "../../hooks/useDebounce"; // đường dẫn đúng của bạn nhé
import { Loader } from "../Loader"; // Import Loader component

const SearchBarWithDropdown = ({
  remote,
  placeholder = "Tìm kiếm...",
  onSearch,
  historys = [],
}) => {
  const [isLoading, startTransition] = useTransition();
  const [isNotFound, setIsNotFound] = useState(false); // Trạng thái để kiểm tra không tìm thấy kết quả
  const [isTyping, setIsTyping] = useState(false); // Trạng thái để kiểm tra người dùng có đang gõ hay không
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 500);

  // Gọi search khi debouncedQuery thay đổi
  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setResults([]);
      setIsTyping(false);
      return;
    }

    startTransition(() => {
      const filtered = onSearch(debouncedQuery);
      if (filtered && filtered.length > 0) {
        setIsNotFound(false);
        setResults(filtered);
      } else {
        setIsNotFound(true); // Nếu không tìm thấy kết quả, đặt trạng thái không tìm thấy
        setResults([]);
      }
      setIsTyping(false);
    });
  }, [debouncedQuery, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsTyping(true); // Đặt trạng thái đang gõ
    setIsNotFound(false); // Reset trạng thái không tìm thấy khi người dùng bắt đầu gõ
  };

  useEffect(() => {
    // Reset trạng thái khi query thay đổi
    if (query.trim() === "") {
      setResults([]);
      setIsNotFound(false);
      setIsTyping(false);
    }
  }, [query]);

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setResults([]); // Ẩn dropdown khi click ra ngoài
      setIsNotFound(false); // Reset trạng thái không tìm thấy
      setIsTyping(false); // Reset trạng thái đang gõ
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form
        className="flex items-center border p-1 border-gray-300 rounded-full overflow-hidden bg-white shadow-sm focus-within:border-blue-500
        dark:border-gray-600 dark:bg-gray-900 dark:focus-within:border-blue-500"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="flex-1 px-4 py-2 text-sm outline-none
           dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 focus:ring-0 focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full mx-1 p-0.5 text-gray-400 hover:bg-gray-500 hover:text-gray-900"
          >
            <X size={12} />
          </button>
        )}
        <button
          type="submit"
          className="px-2 py-2 bg-gray-300 hover:bg-gray-400 text-black transition
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={18} />
        </button>
      </form>

      {(isLoading || isTyping) && (
        <div className="absolute z-10 w-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg flex w-full justify-center items-center">
          <Loader size={1.8} />
        </div>
      )}

      {results.length > 0 ? (
        <div className="absolute z-10 w-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="w-full max-h-80 overflow-y-auto gap-1">
            {results.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-10 h-10 object-cover rounded-md"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.title}</span>
                  <span className="text-xs text-gray-500">
                    {item.artist} • {item.album}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        isNotFound && (
          <div className="absolute z-10 w-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg flex w-full justify-center items-center">
            <strong className="m-2 text-md text-gray-700">
              Không có kết quả tìm kiếm
            </strong>
          </div>
        )
      )}
    </div>
  );
};

export default SearchBarWithDropdown;
