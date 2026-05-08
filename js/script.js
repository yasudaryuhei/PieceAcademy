// 共通処理：対象要素があるページだけ機能を動かします。
(function () {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".global-nav a");

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // スクロール案内：最後の相談CTAが見えたら非表示にします。
  const scrollCue = document.querySelector(".scroll-cue");
  const consultationSection = document.querySelector(".cta-section");
  let scrollCueWasHidden = false;
  function updateScrollCue() {
    if (!scrollCue || scrollCueWasHidden) return;
    const fadeLine = consultationSection ? consultationSection.offsetTop : document.documentElement.scrollHeight;
    if (window.scrollY + window.innerHeight >= fadeLine + 80) {
      scrollCue.classList.add("is-hidden");
      scrollCueWasHidden = true;
    }
  }
  window.addEventListener("scroll", updateScrollCue, { passive: true });
  window.addEventListener("resize", updateScrollCue);
  updateScrollCue();

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ページ内リンク：同一ページ内の移動をなめらかにします。
  document.querySelectorAll('a[href^="#"], [data-scroll-target]').forEach((item) => {
    item.addEventListener("click", (event) => {
      const selector = item.getAttribute("data-scroll-target") || item.getAttribute("href");
      const target = selector && document.querySelector(selector);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 配信元ファーストビュー用：キーワードを切り替えます。
  const keyword = document.getElementById("dynamicKeyword");
  if (keyword) {
    const words = ["AI活用", "業務改善", "IT知識", "技術力", "DX推進", "人材育成", "キャリア形成"];
    let index = 0;
    setInterval(() => {
      keyword.classList.add("is-changing");
      window.setTimeout(() => {
        index = (index + 1) % words.length;
        keyword.textContent = words[index];
        keyword.classList.remove("is-changing");
      }, 260);
    }, 2500);
  }

  // サービス一覧：中央に近いカードを強調します。
  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const cards = Array.from(carousel.querySelectorAll(".service-card"));
    const updatePickedCard = () => {
      const carouselRect = carousel.getBoundingClientRect();
      const center = carouselRect.left + carouselRect.width / 2;
      let picked = cards[0];
      let nearest = Number.POSITIVE_INFINITY;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(center - cardCenter);
        if (distance < nearest) {
          nearest = distance;
          picked = card;
        }
      });

      cards.forEach((card) => card.classList.toggle("is-picked", card === picked));
    };

    carousel.addEventListener("scroll", () => window.requestAnimationFrame(updatePickedCard), { passive: true });
    window.addEventListener("resize", updatePickedCard);
    updatePickedCard();
  }

  // FAQ：開閉状態を支援技術にも伝えます。
  document.querySelectorAll(".faq-item").forEach((item) => {
    const summary = item.querySelector("summary");
    if (!summary) return;
    summary.setAttribute("role", "button");
    summary.setAttribute("aria-expanded", String(item.open));
    item.addEventListener("toggle", () => {
      summary.setAttribute("aria-expanded", String(item.open));
    });
  });

  // FAQページ切り替え：質問が多い場合は約5件ずつ表示します。
  const faqList = document.querySelector(".faq-list");
  if (faqList) {
    const faqItems = Array.from(faqList.querySelectorAll(".faq-item"));
    const perPage = 5;
    const totalPages = Math.ceil(faqItems.length / perPage);

    if (totalPages > 1) {
      const pagination = document.createElement("div");
      pagination.className = "faq-pagination";
      pagination.setAttribute("aria-label", "FAQページ切り替え");
      faqList.after(pagination);

      const showFaqPage = (pageIndex) => {
        faqList.classList.add("is-rotating");
        window.setTimeout(() => {
          faqItems.forEach((item, index) => {
            const isCurrentPage = index >= pageIndex * perPage && index < (pageIndex + 1) * perPage;
            item.classList.toggle("is-hidden", !isCurrentPage);
            if (!isCurrentPage) item.removeAttribute("open");
          });
          pagination.querySelectorAll(".faq-page-btn").forEach((button, index) => {
            const isActive = index === pageIndex;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-current", isActive ? "page" : "false");
          });
          faqList.classList.remove("is-rotating");
        }, 180);
      };

      for (let i = 0; i < totalPages; i += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "faq-page-btn";
        button.textContent = String(i + 1);
        button.setAttribute("aria-label", `FAQ ${i + 1}ページ目を表示`);
        button.addEventListener("click", () => showFaqPage(i));
        pagination.appendChild(button);
      }

      showFaqPage(0);
    }
  }

  // デモフォーム：実際の通信は行わず完了メッセージだけ表示します。
  document.querySelectorAll(".js-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector(".form-message");
      if (message) {
        message.textContent = form.dataset.message || "送信ありがとうございます。";
        message.classList.add("is-visible");
        message.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      form.reset();
    });
  });

  // 配信元ファーストビュー用：背景Canvasを描画します。
  const canvas = document.getElementById("networkCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const labels = ["AI", "DX", "Cloud", "Data", "API", "Web", "UI", "UX", "Security", "Automation"];
  let nodes = [];
  let width = 0;
  let height = 0;
  let maxNodes = 60;
  let mouse = { x: null, y: null };
  let frame = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maxNodes = window.innerWidth < 768 ? 30 : 60;
    nodes = [];
  }

  function createNode() {
    const sideBias = Math.random();
    const x = sideBias < .42 ? rand(0, width * .24) : sideBias > .58 ? rand(width * .72, width) : rand(width * .24, width * .72);
    return {
      x,
      y: rand(0, height),
      vx: rand(-.16, .16),
      vy: rand(-.14, .14),
      r: rand(1.4, 3),
      pulse: rand(0, Math.PI * 2),
      label: Math.random() < .18 ? labels[Math.floor(Math.random() * labels.length)] : ""
    };
  }

  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, width, height);
    if (nodes.length < maxNodes && frame % 5 === 0) nodes.push(createNode());

    nodes.forEach((node) => {
      const nearCenter = Math.abs(node.x - width / 2) < width * .22;
      const alphaBase = nearCenter ? .20 : .46;
      if (mouse.x !== null && window.innerWidth > 768) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          node.x += dx * .0009;
          node.y += dy * .0009;
        }
      }
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;

      ctx.beginPath();
      ctx.fillStyle = `rgba(22,119,232,${alphaBase + Math.sin(frame * .02 + node.pulse) * .08})`;
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
      if (node.label) {
        ctx.fillStyle = `rgba(15,39,66,${nearCenter ? .18 : .34})`;
        ctx.font = "700 12px system-ui, sans-serif";
        ctx.fillText(node.label, node.x + 8, node.y - 8);
      }
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          const centerFade = Math.abs((a.x + b.x) / 2 - width / 2) < width * .22 ? .45 : 1;
          ctx.strokeStyle = `rgba(22,119,232,${(1 - dist / 120) * .18 * centerFade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (event) => { mouse = { x: event.clientX, y: event.clientY }; }, { passive: true });
  window.addEventListener("mouseleave", () => { mouse = { x: null, y: null }; });
  resizeCanvas();
  draw();
})();




// 旧ファーストビュー用：ローダー、キーワード、背景Canvasをまとめて制御します。
document.addEventListener("DOMContentLoaded", () => {
  const heroKeyword = document.querySelector("#hero-keyword");
  const heroCanvas = document.querySelector("#hero-canvas");
  const loader = document.querySelector("#first-visit-loader");
  const loaderOverlay = document.querySelector("#first-visit-loader-overlay");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const codeTerms = ["API", "HTML", "CSS", "JavaScript", "AI", "DX", "Cloud", "Git", "Node.js", "React", "Data", "Design", "Security", "Automation"];

  const resizeCanvas = (canvas, context) => {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, rect.width * pixelRatio);
    canvas.height = Math.max(1, rect.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return rect;
  };

  const buildNetworkNodes = (count, withTypedText = false, speedScale = 1) =>
    Array.from({ length: count }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0019 * speedScale,
      vy: (Math.random() - 0.5) * 0.0019 * speedScale,
      term: codeTerms[index % codeTerms.length],
      phase: Math.random() * Math.PI * 2,
      typed: withTypedText ? 0 : codeTerms[index % codeTerms.length].length,
    }));

  const drawNetwork = (canvas, context, nodes, progress, time, options = {}) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const blueFill = options.blueFill || progress;
    const backgroundAlpha = Math.min(0.96, blueFill * 0.92);
    const gridColor = options.gridColor || `rgba(18, 104, 214, ${0.12 + progress * 0.18})`;
    const lineColor = options.lineColor || "255, 255, 255";
    const textColor = options.textColor || "255, 255, 255";
    const nodeColor = options.nodeColor || "255, 255, 255";
    const accentColor = options.accentColor || "255, 138, 31";

    context.clearRect(0, 0, width, height);
    context.fillStyle = `rgba(18, 104, 214, ${backgroundAlpha})`;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = gridColor;
    context.lineWidth = 1;
    for (let x = 0; x < width; x += 32) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    nodes.forEach((node, index) => {
      node.x += node.vx + Math.sin(time + node.phase) * 0.00012;
      node.y += node.vy + Math.cos(time * 0.85 + node.phase) * 0.00012;
      if (node.x < 0.03 || node.x > 0.97) node.vx *= -1;
      if (node.y < 0.05 || node.y > 0.95) node.vy *= -1;
      node.x = Math.min(0.97, Math.max(0.03, node.x));
      node.y = Math.min(0.95, Math.max(0.05, node.y));
      if (options.typing && progress > index / nodes.length) {
        node.typed = Math.min(node.term.length, node.typed + 0.18);
      }
    });

    const linkDistance = options.linkDistance || 180;
    nodes.forEach((node, index) => {
      const visibleA = !options.typing || progress > index / nodes.length;
      if (!visibleA) return;
      const ax = node.x * width;
      const ay = node.y * height;
      for (let j = index + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const visibleB = !options.typing || progress > j / nodes.length;
        if (!visibleB) continue;
        const bx = other.x * width;
        const by = other.y * height;
        const distance = Math.hypot(ax - bx, ay - by);
        if (distance < linkDistance) {
          const alpha = (1 - distance / linkDistance) * (options.lineAlpha || (0.16 + progress * 0.42));
          context.strokeStyle = `rgba(${lineColor}, ${alpha})`;
          context.lineWidth = options.lineWidth || 1;
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.stroke();
        }
      }
    });

    context.textBaseline = "middle";
    nodes.forEach((node, index) => {
      const visible = !options.typing || progress > index / nodes.length;
      if (!visible) return;
      const x = node.x * width;
      const y = node.y * height;
      const label = node.term.slice(0, Math.max(1, Math.floor(node.typed)));
      const pulse = 0.82 + Math.sin(time * 3 + node.phase) * 0.18;
      context.font = options.font || "700 13px monospace";
      context.fillStyle = `rgba(${textColor}, ${options.textAlpha || (0.72 + pulse * 0.24)})`;
      context.fillText(label, x + 8, y - 2);
      context.fillStyle = index % 4 === 0 ? `rgba(${accentColor}, 0.9)` : `rgba(${nodeColor}, 0.86)`;
      context.beginPath();
      context.arc(x, y, 3.2 + pulse * 1.1, 0, Math.PI * 2);
      context.fill();
    });
  };

  const startFirstVisitLoader = () => {
    if (!loader) return;
    const seenKey = "pieceacademy-loader-seen-v2";
    const forceIntro = new URLSearchParams(window.location.search).has("intro");
    const hasSeen = sessionStorage.getItem(seenKey) === "true";
    if (hasSeen && !forceIntro) {
      loader.remove();
      return;
    }

    document.body.classList.add("overflow-hidden");
    const canvas = loader.querySelector("#loader-canvas");
    const logo = loader.querySelector("#loader-logo");
    const context = canvas.getContext("2d");
    let nodes = [];
    let start = performance.now();
    let time = 0;

    const resize = () => {
      const rect = resizeCanvas(canvas, context);
      const count = Math.max(52, Math.floor((rect.width * rect.height) / 15500));
      nodes = buildNetworkNodes(count, true);
    };

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / 3000);
      drawNetwork(canvas, context, nodes, progress, time, {
        typing: true,
        blueFill: progress,
        font: "800 14px monospace",
        linkDistance: 150 + progress * 75,
      });
      if (elapsed > 2200) {
        logo.classList.remove("opacity-0", "scale-95");
        logo.classList.add("opacity-100", "scale-100");
      }
      if (elapsed > 3300 && loaderOverlay) loaderOverlay.classList.replace("opacity-0", "opacity-100");
      if (elapsed > 3820) {
        loader.classList.add("opacity-0", "pointer-events-none");
        document.body.classList.remove("overflow-hidden");
        sessionStorage.setItem(seenKey, "true");
        window.setTimeout(() => loader.remove(), 750);
        return;
      }
      time += 0.016;
      requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) {
      drawNetwork(canvas, context, nodes, 1, time, { typing: false, blueFill: 1, font: "800 14px monospace", linkDistance: 210 });
      logo.classList.remove("opacity-0", "scale-95");
      logo.classList.add("opacity-100", "scale-100");
      window.setTimeout(() => {
        if (loaderOverlay) loaderOverlay.classList.replace("opacity-0", "opacity-100");
      }, 900);
      window.setTimeout(() => {
        loader.classList.add("opacity-0", "pointer-events-none");
        document.body.classList.remove("overflow-hidden");
        sessionStorage.setItem(seenKey, "true");
        window.setTimeout(() => loader.remove(), 750);
      }, 1300);
      return;
    }
    requestAnimationFrame(animate);
  };

  if (heroKeyword) {
    const keywords = ["Web制作", "AI活用", "DX研修", "業務改善", "キャリア形成"];
    let keywordIndex = 0;
    setInterval(() => {
      keywordIndex = (keywordIndex + 1) % keywords.length;
      heroKeyword.animate([
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 320, easing: "ease-out" });
      heroKeyword.textContent = keywords[keywordIndex];
    }, 1700);
  }

  if (heroCanvas) {
    const context = heroCanvas.getContext("2d");
    let nodes = [];
    let time = 0;
    const resize = () => {
      const rect = resizeCanvas(heroCanvas, context);
      const count = Math.max(44, Math.floor((rect.width * rect.height) / 21000));
      nodes = buildNetworkNodes(count, false, 0.35);
    };
    const drawHero = () => {
      drawNetwork(heroCanvas, context, nodes, 0.5, time, {
        blueFill: 0.01,
        font: "900 15px monospace",
        gridColor: "rgba(18, 104, 214, 0.07)",
        lineColor: "18, 104, 214",
        lineAlpha: 0.22,
        lineWidth: 1,
        textColor: "13, 63, 136",
        textAlpha: 0.42,
        nodeColor: "18, 104, 214",
        accentColor: "255, 138, 31",
        linkDistance: 128,
      });
      time += 0.005;
      requestAnimationFrame(drawHero);
    };
    resize();
    window.addEventListener("resize", resize);
    drawHero();
  }

  startFirstVisitLoader();
});
