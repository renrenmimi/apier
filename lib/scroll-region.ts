// 可滚动区域(代码窗、动画舞台)在内容放不下时必须能用键盘聚焦,否则只用键盘的读者
// 滚不动被截断的内容(axe scrollable-region-focusable)。只有真的溢出时才成为 Tab 停靠点,
// 放得下的代码窗不会多占一次 Tab。
// 用法:<div className="codewin-body" ref={codeRegion}>。ref 是模块级常量,身份稳定,
// React 不会在每次渲染时卸下又装上它;返回的清理函数在元素卸载时断开观察器。

type Label = { en: string; zh: string };

function regionRef(label: Label) {
  return (el: HTMLElement | null) => {
    if (!el) return;
    const html = document.documentElement;
    const apply = () => {
      const overflows = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      if (overflows) {
        el.tabIndex = 0;
        el.setAttribute("role", "region");
        el.setAttribute("aria-label", html.dataset.lang === "zh" ? label.zh : label.en);
      } else {
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
      }
    };
    apply();
    // 尺寸变化(换行、视口)、内容变化(动画换帧)、界面语言变化,都要重新判断
    const resize = new ResizeObserver(apply);
    resize.observe(el);
    const content = new MutationObserver(apply);
    content.observe(el, { childList: true, subtree: true, characterData: true });
    const lang = new MutationObserver(apply);
    lang.observe(html, { attributes: true, attributeFilter: ["data-lang"] });
    return () => {
      resize.disconnect();
      content.disconnect();
      lang.disconnect();
    };
  };
}

export const codeRegion = regionRef({ en: "Code", zh: "代码" });
export const stageRegion = regionRef({ en: "Animation stage", zh: "动画舞台" });
