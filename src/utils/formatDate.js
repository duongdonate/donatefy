function formatDate(isoString) {
  const date = new Date(isoString);

  // Lấy từng thành phần
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // tháng tính từ 0
  const year = date.getFullYear();

  //   const hours = String(date.getHours()).padStart(2, "0");
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  //   const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format kiểu DD/MM/YYYY HH:mm:ss
  return `${day}/${month}/${year}`;
}

export default formatDate;
