
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

  // ---------------------------------------------------------
  // トップページ：時期に合わせて季節講習を自動表示
  //
  // 表示期間（毎年共通）
  // 春期：2/1〜4/15
  // 夏期：5/15〜8/31
  // 冬期：10/15〜1/15
  //
  // 「募集中」とは自動表示せず、講習そのものを案内する仕様。
  // 実際の募集期間が変わっても誤案内になりにくい設計です。
  // ---------------------------------------------------------
  const seasonalFocus = document.querySelector("[data-seasonal-focus]");

  if (seasonalFocus) {
    const now = new Date();
    const monthDay = (now.getMonth() + 1) * 100 + now.getDate();

    const seasonalContent = {
      spring: {
        className: "is-spring",
        kicker: "SPRING COURSE",
        badge: "春のご案内",
        title: "春期講習",
        message: "これまでの復習と、新学年へ向けた準備を。",
        sub: "苦手な分野を見つけて整理し、新しい学年を気持ちよく始められるよう、一人ひとりの学習を支えます。",
        href: "seasonal.html#spring-course",
        button: "春期講習を見る"
      },
      summer: {
        className: "is-summer",
        kicker: "SUMMER COURSE",
        badge: "夏のご案内",
        title: "夏期講習",
        message: "長い夏休みを、できることが増える時間に。",
        sub: "これまでの学習を振り返り、苦手教科や苦手単元にじっくり向き合います。受験学年は高校入試を見据えた準備にも取り組みます。",
        href: "seasonal.html#summer-course",
        button: "夏期講習を見る"
      },
      winter: {
        className: "is-winter",
        kicker: "WINTER COURSE",
        badge: "冬のご案内",
        title: "冬期講習",
        message: "短い冬休みだからこそ、学ぶ内容を絞って丁寧に。",
        sub: "復習や受験対策を通して、次に何を勉強すればよいかを整理し、学習のコツをつかむ期間にします。",
        href: "seasonal.html#winter-course",
        button: "冬期講習を見る"
      },
      default: {
        className: "is-default",
        kicker: "SEASONAL COURSE",
        badge: "季節講習",
        title: "春期・夏期・冬期講習",
        message: "長期休暇だからこそできる学習を、一人ひとりに。",
        sub: "これまでの復習、苦手克服、新学年の準備、受験対策など、その時期と目標に合わせて取り組みます。",
        href: "seasonal.html",
        button: "季節講習を見る"
      }
    };

    let season = "default";

    if (monthDay >= 101 && monthDay <= 115) {
      season = "winter";
    } else if (monthDay >= 201 && monthDay <= 415) {
      season = "spring";
    } else if (monthDay >= 515 && monthDay <= 831) {
      season = "summer";
    } else if (monthDay >= 1015 && monthDay <= 1231) {
      season = "winter";
    }

    const content = seasonalContent[season];

    seasonalFocus.classList.remove("is-spring", "is-summer", "is-winter", "is-default");
    seasonalFocus.classList.add(content.className);

    const kicker = seasonalFocus.querySelector("[data-seasonal-kicker]");
    const badge = seasonalFocus.querySelector("[data-seasonal-badge]");
    const title = seasonalFocus.querySelector("[data-seasonal-title]");
    const message = seasonalFocus.querySelector("[data-seasonal-message]");
    const sub = seasonalFocus.querySelector("[data-seasonal-sub]");
    const link = seasonalFocus.querySelector("[data-seasonal-link]");

    if (kicker) kicker.textContent = content.kicker;
    if (badge) badge.textContent = content.badge;
    if (title) title.textContent = content.title;
    if (message) message.textContent = content.message;
    if (sub) sub.textContent = content.sub;
    if (link) {
      link.href = content.href;
      link.textContent = content.button;
    }
  }

});
