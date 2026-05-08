(() => {
  const headerClassActive = "border-b-2 border-bluebrand py-2 text-sm font-semibold text-navy";
  const headerClassDefault = "py-2 text-sm font-semibold text-slate-700 hover:text-bluebrand";

  const inDetailDir = /\/company\/company-detail\//.test(window.location.pathname);
  const inSubDir = /\/(about|contact|faq|service|individual|company)\//.test(window.location.pathname);
  const basePrefix = inDetailDir ? "../../" : inSubDir ? "../" : "";
  const route = (path) => `${basePrefix}${path}`;

  const navItems = [
    { key: "home", href: route("index.html"), label: "Top" },
    { key: "about", href: route("about/about.html"), label: "PieceAcademyとは" },
    { key: "services", href: route("service/services.html"), label: "サービス" },
    { key: "corporations", href: route("company/corporations.html"), label: "企業様の方はこちら" },
    { key: "faq", href: route("faq/faq.html"), label: "FAQ" },
    { key: "contact", href: route("contact/contact.html"), label: "お問い合わせ" }
  ];

  const footerLinks = [
    { href: route("index.html"), label: "Top" },
    { href: route("about/about.html"), label: "PieceAcademyとは" },
    { href: route("service/services.html"), label: "サービス" },
    { href: route("company/corporations.html"), label: "企業様の方はこちら" }
  ];

  const infoLinks = [
    { href: route("faq/faq.html"), label: "FAQ" },
    { href: route("contact/contact.html"), label: "お問い合わせ" },
    { href: "#", label: "プライバシーポリシー" },
    { href: "#", label: "特定商取引法に基づく表記" }
  ];

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const pageAttr = this.getAttribute("page") || "";
      const activePage = pageAttr;

      const navHtml = navItems
        .map((item) => {
          const className = item.key === activePage ? headerClassActive : headerClassDefault;
          return `<a class="${className}" href="${item.href}">${item.label}</a>`;
        })
        .join("");

      this.innerHTML = `
        <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
            <a href="${route("index.html")}" class="flex items-center gap-3" aria-label="PieceAcademy トップ">
              <span class="text-xl font-bold tracking-normal text-navy">PieceAcademy</span>
            </a>

            <nav class="hidden items-center gap-8 lg:flex" aria-label="メインナビゲーション">
              ${navHtml}
            </nav>

            <a href="${route("contact/contact.html")}" class="rounded-md bg-orangebrand px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-orange-600">無料相談</a>
          </div>
        </header>
      `;
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      const pageLinksHtml = footerLinks
        .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
        .join("");
      const infoLinksHtml = infoLinks
        .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
        .join("");

      this.innerHTML = `
        <footer class="bg-navy py-10 text-white">
          <div class="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-4 lg:px-8">
            <div>
              <div class="flex items-center gap-3">
                <p class="text-xl font-black">PieceAcademy</p>
              </div>
              <p class="mt-5 text-sm leading-7 text-white/80">IT・DX・プログラミング教育を通じて、一人ひとりの可能性を広げ、社会の未来を創ります。</p>
            </div>

            <div>
              <h3 class="font-black">サイトマップ</h3>
              <ul class="mt-4 space-y-2 text-sm text-white/80">
                ${pageLinksHtml}
              </ul>
            </div>

            <div>
              <h3 class="font-black">情報</h3>
              <ul class="mt-4 space-y-2 text-sm text-white/80">
                ${infoLinksHtml}
              </ul>
            </div>

            <div>
              <h3 class="font-black">運営会社</h3>
              <p class="mt-4 text-sm leading-7 text-white/80">株式会社PieceAcademy<br>東京都渋谷区代々木2-23-1<br>info@piece-academy.jp<br>03-1234-5678</p>
            </div>
          </div>
          <p class="mx-auto mt-8 max-w-7xl px-5 text-center text-xs text-white/70 lg:px-8">© 2026 PieceAcademy Inc. All Rights Reserved.</p>
        </footer>
      `;
    }
  }

  customElements.define("site-header", SiteHeader);
  customElements.define("site-footer", SiteFooter);
})();
