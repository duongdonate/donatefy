// Câu nói của Matcappa trên landing, theo từng bước (landing-mascot.html)
export const LANDING_LINES = [
  ["Nghe nhạc thôi nào ~", "Dán một link YouTube là mình quay đĩa liền!", "Hôm nay bạn muốn nghe gì nè?", "Lăn xuống xem tiếp đi ~", "Mình là Matcappa, chào bạn nha!"],
  ["Một màn hình, một chiếc đĩa. Thử không?", "Mình đang ôm đĩa nè, nghe chung đi ~", "Chong chóng quay là nhạc đang phát đó!", "Nút nào không cần là mình giấu đi hết ~", "Lướt dải bìa ở dưới để đổi bài nha."],
  ["Thong thả thôi ~", "Pha chén nhạc đầu tiên với mình nha!", "Một chén matcha, một chiếc đĩa, vậy là đủ.", "Mình buồn ngủ rồi… mà nhạc thì vẫn hay ~", "Cảm ơn bạn đã ghé quán!"],
];

// Chọn câu khác câu vừa nói; -1 nếu không có câu nào
export function pickLine(lines, lastIndex, rand = Math.random) {
  const n = lines.length;
  if (n <= 1) return n - 1;
  const skip = lastIndex >= 0 && lastIndex < n;
  const i = Math.floor(rand() * (skip ? n - 1 : n));
  return skip && i >= lastIndex ? i + 1 : i;
}
