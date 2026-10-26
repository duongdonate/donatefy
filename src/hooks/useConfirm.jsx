// useConfirm.js
import { useCallback } from "react";
import { Button } from "../components";
import usePopup from "./usePopup";

export default function useConfirm() {
  const { openPopup, closePopup } = usePopup();

  const confirm = useCallback(
    (message) => {
      return new Promise((resolve) => {
        const handleResult = (result) => {
          resolve(result);
          closePopup(); // onDismiss resolve(false) lần nữa: Promise đã chốt nên vô hại
        };

        openPopup(
          <div className="flex flex-col gap-6 pr-8">
            <p className="text-base font-semibold">{message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" autoFocus className="!text-[#eef3e6] hover:!bg-white/10" onClick={() => handleResult(false)}>
                Hủy bỏ
              </Button>
              <Button size="sm" className="!bg-[#b3261e] hover:!bg-[#9a1f18]" onClick={() => handleResult(true)}>
                Xóa
              </Button>
            </div>
          </div>,
          () => resolve(false)
        );
      });
    },
    [openPopup, closePopup]
  );

  return confirm;
}
