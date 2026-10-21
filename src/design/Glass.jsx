// Khối kính mờ: dùng class .glass có sẵn (App.css), blur thêm tại chỗ
export default function Glass({ as: Tag = "div", blur = 18, className = "", style, ...props }) {
  const filter = `blur(${blur}px)`;
  return (
    <Tag
      className={`glass ${className}`}
      style={{ backdropFilter: filter, WebkitBackdropFilter: filter, ...style }}
      {...props}
    />
  );
}
