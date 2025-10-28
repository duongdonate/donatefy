// useConfirm.js
import { useCallback } from "react";
import usePopup from "./usePopup";

export default function useConfirm() {
  const { openPopup, closePopup } = usePopup();

  const confirm = useCallback(
    (message) => {
      return new Promise((resolve) => {
        const handleResult = (result) => {
          resolve(result);
          closePopup();
        };

        openPopup(
          <div className="flex flex-col gap-6">
            <p className="text-md font-medium">{message}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-popover text-popover-foreground hover:scale-95 transition-transform"
                onClick={() => handleResult(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:scale-95 transition-transform"
                onClick={() => handleResult(true)}
              >
                Xóa
              </button>
            </div>
          </div>
        );
      });
    },
    [openPopup, closePopup]
  );

  return confirm;
}
