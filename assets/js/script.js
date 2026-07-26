
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-loaded");

  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".global-nav");

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 10);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") === "true";
      menu.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("is-menu-open", !open);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      menu.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      nav.classList.remove("is-open");
      document.body.classList.remove("is-menu-open");
    }));
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const form = document.querySelector("#contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const endpoint = form.dataset.endpoint?.trim();
      if (!endpoint) {
        const data = new FormData(form);
        const summary = [
          `お名前：${data.get("name") || ""}`,
          `メール：${data.get("email") || ""}`,
          `電話：${data.get("phone") || ""}`,
          `学年：${data.get("grade") || ""}`,
          `内容：${data.get("type") || ""}`,
          `相談内容：${data.get("message") || ""}`
        ].join("\n");
        try {
          await navigator.clipboard.writeText(summary);
          status.textContent = "提案用のため送信設定前です。入力内容をクリップボードへコピーしました。";
        } catch {
          status.textContent = "提案用のため送信設定前です。公開時にフォーム送信先を設定してください。";
        }
        return;
      }
      status.textContent = "送信中です…";
      try {
        const response = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("送信できませんでした");
        form.reset();
        status.textContent = "お問い合わせを送信しました。";
      } catch {
        status.textContent = "送信に失敗しました。お電話でお問い合わせください。";
      }
    });
  }
});
