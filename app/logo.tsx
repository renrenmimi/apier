// 品牌标:一对花括号之间,一来一回两支箭 —— 请求出门、响应回家。
// 纯 SVG,继承 currentColor,放在渐变底的 .brand-mark 里。

export function BrandMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 3.5c-2 0-3 1-3 3v2c0 1.4-.6 2.3-2 2.5v2c1.4.2 2 1.1 2 2.5v2c0 2 1 3 3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M17 3.5c2 0 3 1 3 3v2c0 1.4.6 2.3 2 2.5v2c-1.4.2-2 1.1-2 2.5v2c0 2-1 3-3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M8.5 9.5h6m0 0-2-2m2 2-2 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 14.5h-6m0 0 2-2m-2 2 2 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
