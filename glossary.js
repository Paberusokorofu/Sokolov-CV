(function () {
  const ROOT_SEL = "[data-auto-root], #automation";
  const SKIP_SEL =
    "script,style,svg,textarea,input,code,pre,.tip,[data-auto-tab],[data-i18n='auto_title'],[data-i18n='auto_tab_modern'],[data-i18n='auto_tab_lean']";

  const ENTRIES = [
    {
      key: "waste_motion",
      patterns: ["waste: motion / overprocessing"],
      ru: "Потери Lean: лишние перемещения и переделка уже сделанной работы (лишние проверки, переформатирование).",
      en: "Lean wastes: unnecessary movement and doing more work than needed (extra checks, reformatting).",
    },
    {
      key: "waste_waiting",
      patterns: ["waste: waiting"],
      ru: "Потеря Lean: простой заявки в очереди, пока никто над ней не работает.",
      en: "Lean waste: the request sits idle in a queue while nobody is working on it.",
    },
    {
      key: "waste_rework",
      patterns: ["waste: rework"],
      ru: "Потеря Lean: возвраты на доработку из‑за ошибок или неполного пакета.",
      en: "Lean waste: sending work back for fixes because of errors or an incomplete package.",
    },
    {
      key: "vsm_full",
      patterns: ["Value Stream Mapping"],
      ru: "Карта потока создания ценности: рисует шаги процесса, время работы и ожидания, чтобы увидеть потери.",
      en: "A map of the value stream: process steps, work time and waits, so you can see waste.",
    },
    {
      key: "tribal",
      patterns: ["tribal knowledge"],
      ru: "Знания «в головах» у отдельных людей, а не в общем, доступном источнике.",
      en: "Know-how that lives only in people’s heads, not in a shared system of record.",
    },
    {
      key: "visual_mgmt",
      patterns: ["visual management"],
      ru: "Визуальное управление: статус и правила видны сразу (доски, метки, единый вид потока).",
      en: "Making status and rules visible at a glance (boards, labels, a shared view of the flow).",
    },
    {
      key: "pull_std",
      patterns: ["pull / standard work"],
      ru: "Pull — берут работу по готовности, не толкают в очередь. Standard work — единый согласованный способ выполнять шаг.",
      en: "Pull means taking work when ready, not pushing into a queue. Standard work is the agreed way to do a step.",
    },
    {
      key: "standard_work",
      patterns: ["standard work"],
      ru: "Стандарт работы: описанный и повторяемый способ выполнять шаг процесса.",
      en: "The agreed, repeatable way to perform a process step.",
    },
    {
      key: "first_pass",
      patterns: ["First-pass approval", "first-pass approval"],
      ru: "Доля заявок, согласованных с первого раза без возвратов на доработку.",
      en: "Share of requests approved on the first pass, without rework loops.",
    },
    {
      key: "decision_pack",
      patterns: ["decision pack"],
      ru: "Короткий пакет материалов для ЛПР: суть, риски, рекомендации и ссылки на источники.",
      en: "A short pack for the decision-maker: summary, risks, recommendation, and source links.",
    },
    {
      key: "audit_trail",
      patterns: ["audit trail"],
      ru: "Журнал следа: кто что утвердил, когда и на каком основании.",
      en: "A trace of who approved what, when, and on what basis.",
    },
    {
      key: "chunk_index",
      patterns: ["chunk/index", "Chunk / index", "chunk / index"],
      ru: "Текст режут на фрагменты (chunk) и кладут в поисковый индекс — так RAG быстрее находит нужное.",
      en: "Text is split into chunks and indexed so RAG can retrieve the right passages quickly.",
    },
    {
      key: "ai_agent",
      patterns: ["AI agent", "AI-агент", "AI-агенту"],
      ru: "Программа-агент: сама выполняет шаги (собрать пакет, напомнить, эскалировать) по правилам.",
      en: "Software that carries out steps on its own (assemble a pack, remind, escalate) under rules.",
    },
    {
      key: "poka",
      patterns: ["poka-yoke", "Poka-yoke"],
      ru: "Защита от ошибки: проверка на входе не даёт отправить неполный или неверный пакет дальше.",
      en: "Mistake-proofing: intake checks block incomplete or invalid packages from going further.",
    },
    {
      key: "lead_time",
      patterns: ["Lead time", "lead time"],
      ru: "Полное время от старта заявки до готового результата, включая ожидание в очередях.",
      en: "Elapsed time from request start to finished outcome, including queue waits.",
    },
    {
      key: "ocr_rag",
      patterns: ["OCR→RAG", "OCR → RAG", "OCR + RAG"],
      ru: "Сначала OCR превращает скан в текст, затем RAG отвечает по этому тексту с опорой на источники.",
      en: "OCR turns a scan into text; RAG then answers from that text with grounded sources.",
    },
    {
      key: "as_is",
      patterns: ["As-Is", "AS-IS"],
      ru: "Текущее состояние процесса «как есть», до улучшений.",
      en: "The process as it runs today, before improvements.",
    },
    {
      key: "to_be",
      patterns: ["To-Be"],
      ru: "Целевое состояние процесса «как будет» после изменений и автоматизации.",
      en: "The target process state after changes and automation.",
    },
    {
      key: "re_entry",
      patterns: ["re-entry"],
      ru: "Повторный заход заявки на тот же этап после возврата на доработку.",
      en: "The request re-enters the same stage after being sent back for fixes.",
    },
    {
      key: "re_submit",
      patterns: ["re-submit", "re-submits"],
      ru: "Повторная подача заявки после исправлений.",
      en: "Submitting the request again after corrections.",
    },
    {
      key: "pct_ca",
      patterns: ["%C/A"],
      ru: "Complete and Accurate: доля пакетов, принятых полными и без ошибок с первого раза.",
      en: "Complete and Accurate: share of packages accepted complete and correct on the first pass.",
    },
    {
      key: "playbook",
      patterns: ["playbook"],
      ru: "Операционный регламент: роли, ритм встреч, эскалации и «что делать когда».",
      en: "An operating guide: roles, meeting cadence, escalations, and what to do when.",
    },
    {
      key: "compliance",
      patterns: ["compliance"],
      ru: "Соответствие правилам, политикам и юридическим требованиям.",
      en: "Conformity with rules, policies, and legal requirements.",
    },
    {
      key: "searchable",
      patterns: ["searchable"],
      ru: "По тексту можно искать, а не только листать картинки и PDF глазами.",
      en: "You can search the text, not only skim images and PDFs by eye.",
    },
    {
      key: "delivery",
      patterns: ["delivery", "Delivery"],
      ru: "Доставка результата проекта: от требований до релиза и закрытия.",
      en: "Delivering the project outcome: from requirements through release and close-out.",
    },
    {
      key: "handoff",
      patterns: ["handoff"],
      ru: "Передача работы между людьми или системами — частый источник задержек.",
      en: "Handing work between people or systems — a common source of delay.",
    },
    {
      key: "cadence",
      patterns: ["cadence"],
      ru: "Регулярный ритм ритуалов (еженедельный дайджест, ретро, статус).",
      en: "A regular rhythm of rituals (weekly digest, retro, status).",
    },
    {
      key: "kpi",
      patterns: ["KPI"],
      ru: "Ключевой показатель эффективности — измеримая цель или метрика результата.",
      en: "Key Performance Indicator — a measurable outcome metric.",
    },
    {
      key: "rag",
      patterns: ["RAG"],
      ru: "Retrieval-Augmented Generation: ИИ сначала ищет фрагменты в базе знаний, потом отвечает с опорой на них.",
      en: "Retrieval-Augmented Generation: the model retrieves knowledge-base passages, then answers grounded in them.",
    },
    {
      key: "ocr",
      patterns: ["OCR"],
      ru: "Optical Character Recognition: распознавание текста со сканов, фото и PDF.",
      en: "Optical Character Recognition: reading text from scans, photos, and PDFs.",
    },
    {
      key: "llm",
      patterns: ["LLM"],
      ru: "Large Language Model — большая языковая модель (ChatGPT-класс) для текста и рассуждений.",
      en: "Large Language Model — a ChatGPT-class model for text and reasoning.",
    },
    {
      key: "vsm",
      patterns: ["VSM"],
      ru: "Value Stream Mapping — карта потока ценности (шаги, время, потери).",
      en: "Value Stream Mapping — a value-stream map of steps, time, and waste.",
    },
    {
      key: "five_s",
      patterns: ["5S"],
      ru: "Lean-практика наведения порядка: сортировка, систематизация, чистота, стандартизация, дисциплина (в т.ч. для базы знаний).",
      en: "Lean workplace order: sort, set in order, shine, standardize, sustain (also for a knowledge corpus).",
    },
    {
      key: "pt",
      patterns: ["PT"],
      ru: "Process Time — чистое время работы над шагом, без ожидания в очереди.",
      en: "Process Time — pure working time on a step, excluding queue wait.",
    },
    {
      key: "wait",
      patterns: ["Wait"],
      ru: "Время ожидания в очереди, пока шаг не начат или не продолжен.",
      en: "Queue wait time before a step starts or continues.",
    },
    {
      key: "pull",
      patterns: ["pull"],
      ru: "Вытягивание: следующий этап берёт работу, когда готов, вместо «заталкивания» в очередь.",
      en: "Pull: the next stage takes work when ready, instead of pushing into a queue.",
    },
    {
      key: "waiting",
      patterns: ["waiting"],
      ru: "Ожидание — один из видов потерь Lean (простой без полезной работы).",
      en: "Waiting — a Lean waste type (idle time with no value-adding work).",
    },
    {
      key: "rework",
      patterns: ["rework"],
      ru: "Переделка уже сделанной работы из‑за дефектов или неполноты.",
      en: "Redoing work because of defects or incompleteness.",
    },
    {
      key: "overprocessing",
      patterns: ["overprocessing"],
      ru: "Избыточная обработка: больше действий, чем нужно клиенту процесса.",
      en: "Doing more processing than the process customer needs.",
    },
    {
      key: "motion",
      patterns: ["motion"],
      ru: "Лишние перемещения людей или «беготня» за файлами и согласованиями.",
      en: "Unnecessary movement — chasing files, people, or approvals.",
    },
    {
      key: "agent",
      patterns: ["agents", "agent"],
      ru: "Агент — автономный помощник, который выполняет поручения в процессе по правилам.",
      en: "An agent is an autonomous helper that carries out process tasks under rules.",
    },
  ];

  const SKIP_PHRASES = ["A modern AI company", "Modern AI company", "Lean+AI", "Lean + AI"];

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function buildMatcher() {
    const items = [];
    for (const entry of ENTRIES) {
      for (const p of entry.patterns) {
        items.push({ key: entry.key, phrase: p, entry });
      }
    }
    items.sort((a, b) => b.phrase.length - a.phrase.length);

    const parts = items.map((it) => {
      const e = escapeRe(it.phrase);
      if (/^[A-Za-z%0-9]/.test(it.phrase) && /[A-Za-z0-9]$/.test(it.phrase) && !/[\/\s·→]/.test(it.phrase)) {
        return `\\b${e}\\b`;
      }
      return e;
    });
    const re = new RegExp(`(${parts.join("|")})`, "gi");
    return { re, items };
  }

  const MATCHER = buildMatcher();

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ru";
  }

  function textFor(entry) {
    return lang() === "en" ? entry.en : entry.ru;
  }

  function findEntry(matched) {
    const m = matched.toLowerCase();
    for (const it of MATCHER.items) {
      if (it.phrase.toLowerCase() === m) return it.entry;
    }
    return null;
  }

  function isSkippedContext(el) {
    if (!el || !el.closest) return true;
    if (el.closest(SKIP_SEL)) return true;
    return false;
  }

  function overlapsSkipPhrase(text, start, end) {
    const lower = text.toLowerCase();
    for (const phrase of SKIP_PHRASES) {
      const p = phrase.toLowerCase();
      let from = 0;
      while (from < lower.length) {
        const i = lower.indexOf(p, from);
        if (i < 0) break;
        const j = i + p.length;
        if (start < j && end > i) return true;
        from = i + 1;
      }
    }
    return false;
  }

  function createTip(term, entry) {
    const abbr = document.createElement("abbr");
    abbr.className = "tip";
    abbr.tabIndex = 0;
    abbr.dataset.tipKey = entry.key;
    abbr.dataset.term = term;
    abbr.setAttribute("aria-label", `${term}: ${textFor(entry)}`);
    abbr.title = textFor(entry);

    const label = document.createTextNode(term);
    const bubble = document.createElement("span");
    bubble.className = "tip__bubble";
    bubble.setAttribute("role", "tooltip");
    bubble.textContent = textFor(entry);

    abbr.appendChild(label);
    abbr.appendChild(bubble);
    return abbr;
  }

  function unwrapTips(root) {
    root.querySelectorAll("abbr.tip").forEach((abbr) => {
      const term = abbr.dataset.term || abbr.childNodes[0]?.textContent || "";
      abbr.replaceWith(document.createTextNode(term));
    });
  }

  function enhanceTextNode(node) {
    const text = node.nodeValue;
    if (!text || !/[A-Za-z%0-9]/.test(text)) return;

    MATCHER.re.lastIndex = 0;
    if (!MATCHER.re.test(text)) return;
    MATCHER.re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = MATCHER.re.exec(text))) {
      const start = m.index;
      const end = start + m[0].length;
      if (overlapsSkipPhrase(text, start, end)) continue;
      const entry = findEntry(m[0]);
      if (!entry) continue;
      if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));
      frag.appendChild(createTip(m[0], entry));
      last = end;
    }
    if (last === 0) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function collectTextNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (isSkippedContext(p)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  let suppressObs = false;

  function enhance(root) {
    if (!root) return;
    suppressObs = true;
    try {
      unwrapTips(root);
      const nodes = collectTextNodes(root);
      for (const node of nodes) enhanceTextNode(node);
    } finally {
      queueMicrotask(() => {
        suppressObs = false;
      });
    }
  }

  function roots() {
    return Array.from(document.querySelectorAll(ROOT_SEL));
  }

  function enhanceAll() {
    roots().forEach(enhance);
  }

  let openTip = null;

  function closeOpen() {
    if (openTip) {
      openTip.classList.remove("is-open");
      openTip = null;
    }
  }

  function bindUi(root) {
    if (!root || root.dataset.glossaryBound === "1") return;
    root.dataset.glossaryBound = "1";

    root.addEventListener("click", (e) => {
      const tip = e.target.closest("abbr.tip");
      if (!tip || !root.contains(tip)) {
        closeOpen();
        return;
      }
      e.preventDefault();
      if (openTip === tip) {
        closeOpen();
        return;
      }
      closeOpen();
      tip.classList.add("is-open");
      openTip = tip;
    });

    root.addEventListener("keydown", (e) => {
      const tip = e.target.closest?.("abbr.tip");
      if (!tip || !root.contains(tip)) return;
      if (e.key === "Escape") {
        closeOpen();
        tip.blur();
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (openTip === tip) closeOpen();
        else {
          closeOpen();
          tip.classList.add("is-open");
          openTip = tip;
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (openTip && !e.target.closest?.("abbr.tip")) closeOpen();
    });
  }

  function observeDynamic(root) {
    if (!root || root.dataset.glossaryObs === "1") return;
    root.dataset.glossaryObs = "1";
    let t = 0;
    const mo = new MutationObserver((mutations) => {
      if (suppressObs) return;
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length) {
          clearTimeout(t);
          t = setTimeout(() => {
            if (!suppressObs) enhance(root);
          }, 40);
          return;
        }
      }
    });
    mo.observe(root, { childList: true, subtree: true });
  }

  function init() {
    roots().forEach((root) => {
      enhance(root);
      bindUi(root);
      observeDynamic(root);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const prevApply = window.applyLang;
  if (typeof prevApply === "function") {
    window.applyLang = function (lang, opts) {
      prevApply(lang, opts);
      enhanceAll();
    };
  }

  window.GlossaryTips = { enhance, enhanceAll, ENTRIES };
})();
