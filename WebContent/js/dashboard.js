// ============================================================
// SPLIT IT - CORE DASHBOARD ENGINE (NO EMOJIS, CLEAN SVGS)
// ============================================================

(function () {
  'use strict';

  // Default Initial Data
  const DEFAULT_EXPENSES = [
    {
      id: 101,
      title: "Team Lunch and Refreshments",
      amount: 1200,
      category: "Food",
      splitWith: "Bob, Charlie",
      date: "2026-10-22"
    },
    {
      id: 102,
      title: "Airport Taxi",
      amount: 450,
      category: "Travel",
      splitWith: "David",
      date: "2026-10-21"
    },
    {
      id: 103,
      title: "Monthly Electricity Bill",
      amount: 1800,
      category: "Utilities",
      splitWith: "Roommate (Sam)",
      date: "2026-10-18"
    },
    {
      id: 104,
      title: "Concert Tickets",
      amount: 900,
      category: "Entertainment",
      splitWith: "Priya, Rahul",
      date: "2026-10-14"
    },
    {
      id: 105,
      title: "Office Supplies",
      amount: 250,
      category: "Other",
      splitWith: "",
      date: "2026-10-10"
    }
  ];

  const DEFAULT_SPLITS = [
    {
      id: 201,
      expenseId: 101,
      person: "Bob",
      amount: 400,
      type: "TO_RECEIVE",
      status: "PENDING",
      expenseTitle: "Team Lunch and Refreshments"
    },
    {
      id: 202,
      expenseId: 101,
      person: "Charlie",
      amount: 400,
      type: "TO_RECEIVE",
      status: "PAID",
      expenseTitle: "Team Lunch and Refreshments"
    },
    {
      id: 203,
      expenseId: 102,
      person: "David",
      amount: 225,
      type: "TO_RECEIVE",
      status: "PENDING",
      expenseTitle: "Airport Taxi"
    },
    {
      id: 204,
      expenseId: 103,
      person: "Sam (Roommate)",
      amount: 900,
      type: "TO_PAY",
      status: "PENDING",
      expenseTitle: "Monthly Electricity Bill"
    },
    {
      id: 205,
      expenseId: 104,
      person: "Priya",
      amount: 300,
      type: "TO_RECEIVE",
      status: "PENDING",
      expenseTitle: "Concert Tickets"
    }
  ];

  // State Management
  let expenses = [];
  let splits = [];
  let activeTab = "all";           // "all", "to_receive", "to_pay"
  let activeCategory = "All";      // "All", "Food", "Travel", "Utilities", "Entertainment", "Other"
  let searchQuery = "";
  let categoryChartInstance = null;
  let monthlyChartInstance = null;

  // Clean SVG Icons for categories (No Emojis)
  const catSvgs = {
    Food: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
    Travel: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
    Utilities: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    Entertainment: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`,
    Other: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`
  };

  const receiveSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
  const paySvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 14 12 9 7 14"></polyline><line x1="12" y1="9" x2="12" y2="21"></line></svg>`;

  function init() {
    initTheme();
    loadData();
    bindEvents();
    renderAll();
  }

  // --- Theme Management ---
  function initTheme() {
    const saved = localStorage.getItem("app_theme") || "light";
    setTheme(saved);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
    const textEl = document.getElementById("themeToggleText");
    const iconEl = document.getElementById("themeIcon");

    if (textEl && iconEl) {
      if (theme === "dark") {
        textEl.textContent = "Light mode";
        iconEl.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      } else {
        textEl.textContent = "Dark mode";
        iconEl.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
      }
    }
    if (categoryChartInstance) renderCharts();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  }

  // --- Data Loading & Storage ---
  function loadData() {
    const savedExp = localStorage.getItem("app_expenses");
    const savedSplits = localStorage.getItem("app_splits");

    if (savedExp) {
      expenses = JSON.parse(savedExp);
    } else {
      expenses = [...DEFAULT_EXPENSES];
      saveLocal();
    }

    if (savedSplits) {
      splits = JSON.parse(savedSplits);
    } else {
      splits = [...DEFAULT_SPLITS];
      saveLocal();
    }

    fetch("api/expenses")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && data.expenses && data.expenses.length > 0) {
          expenses = data.expenses;
          if (data.splits) splits = data.splits;
          saveLocal();
          renderAll();
        }
      })
      .catch(() => {});
  }

  function saveLocal() {
    localStorage.setItem("app_expenses", JSON.stringify(expenses));
    localStorage.setItem("app_splits", JSON.stringify(splits));
  }

  // --- Calculations ---
  function calculateMetrics() {
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const toReceive = splits
      .filter(s => s.type === "TO_RECEIVE" && s.status === "PENDING")
      .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const toPay = splits
      .filter(s => s.type === "TO_PAY" && s.status === "PENDING")
      .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    return { totalSpent, toReceive, toPay };
  }

  // --- Event Bindings ---
  function bindEvents() {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    const profileBtn = document.getElementById("userProfileBtn");
    const profileModal = document.getElementById("profileModal");
    const profileClose = document.getElementById("profileModalClose");
    if (profileBtn) profileBtn.addEventListener("click", () => openProfileModal());
    if (profileClose) profileClose.addEventListener("click", () => closeModal("profileModal"));

    const addBtn = document.getElementById("openAddExpenseBtn");
    const addModal = document.getElementById("addExpenseModal");
    const addClose = document.getElementById("addModalClose");
    const addCancel = document.getElementById("addModalCancel");
    if (addBtn) addBtn.addEventListener("click", () => openAddModal());
    if (addClose) addClose.addEventListener("click", () => closeModal("addExpenseModal"));
    if (addCancel) addCancel.addEventListener("click", () => closeModal("addExpenseModal"));

    [profileModal, addModal].forEach(m => {
      if (m) {
        m.addEventListener("click", e => {
          if (e.target === m) closeModal(m.id);
        });
      }
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.getAttribute("data-tab");
        renderList();
      });
    });

    document.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeCategory = pill.getAttribute("data-category");
        renderList();
      });
    });

    const searchInput = document.getElementById("expenseSearch");
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderList();
      });
    }

    const isSplitCheckbox = document.getElementById("isSplitCheckbox");
    const splitFieldsBox = document.getElementById("splitFieldsBox");
    if (isSplitCheckbox && splitFieldsBox) {
      isSplitCheckbox.addEventListener("change", () => {
        splitFieldsBox.style.display = isSplitCheckbox.checked ? "flex" : "none";
        updateSplitPreview();
      });
    }

    const amountInput = document.getElementById("expenseAmount");
    const splitPeopleInput = document.getElementById("splitPeople");
    if (amountInput) amountInput.addEventListener("input", updateSplitPreview);
    if (splitPeopleInput) splitPeopleInput.addEventListener("input", updateSplitPreview);

    const addForm = document.getElementById("addExpenseForm");
    if (addForm) {
      addForm.addEventListener("submit", handleAddExpense);
    }

    const monthSelect = document.getElementById("analyticsMonthSelect");
    if (monthSelect) {
      monthSelect.addEventListener("change", () => renderCharts());
    }
  }

  // --- Dynamic Split Preview ---
  function updateSplitPreview() {
    const isSplit = document.getElementById("isSplitCheckbox").checked;
    const previewChip = document.getElementById("splitPreviewChip");
    if (!isSplit || !previewChip) return;

    const amount = parseFloat(document.getElementById("expenseAmount").value) || 0;
    const peopleStr = document.getElementById("splitPeople").value.trim();
    const type = document.querySelector('input[name="splitType"]:checked').value;

    const people = peopleStr ? peopleStr.split(",").map(p => p.trim()).filter(Boolean) : [];
    if (amount <= 0 || people.length === 0) {
      previewChip.textContent = "Enter amount and names to calculate split";
      return;
    }

    const totalCount = people.length + (type === "TO_RECEIVE" ? 1 : 0);
    const perPerson = (amount / totalCount).toFixed(2);

    if (type === "TO_RECEIVE") {
      previewChip.textContent = `Split ${totalCount} ways: ₹${perPerson} each (${people.join(", ")} owe you)`;
    } else {
      previewChip.textContent = `You owe ₹${perPerson} to ${people[0] || 'person'}`;
    }
  }

  // --- Add Expense Submission ---
  function handleAddExpense(e) {
    e.preventDefault();

    const title = document.getElementById("expenseTitle").value.trim();
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;
    const date = document.getElementById("expenseDate").value || new Date().toISOString().split("T")[0];
    const isSplit = document.getElementById("isSplitCheckbox").checked;
    const peopleStr = document.getElementById("splitPeople").value.trim();
    const splitType = document.querySelector('input[name="splitType"]:checked').value;

    if (!title || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid title and amount.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      title,
      amount,
      category,
      splitWith: isSplit ? peopleStr : "",
      date
    };

    expenses.unshift(newExpense);

    if (isSplit && peopleStr) {
      const names = peopleStr.split(",").map(n => n.trim()).filter(Boolean);
      const totalCount = names.length + (splitType === "TO_RECEIVE" ? 1 : 0);
      const perPerson = Math.round((amount / totalCount) * 100) / 100;

      names.forEach((personName, idx) => {
        splits.unshift({
          id: Date.now() + idx + 1,
          expenseId: newExpense.id,
          person: personName,
          amount: perPerson,
          type: splitType,
          status: "PENDING",
          expenseTitle: title
        });
      });
    }

    saveLocal();

    const formData = new URLSearchParams();
    formData.append("title", title);
    formData.append("amount", amount);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("splitWith", isSplit ? peopleStr : "");
    formData.append("splitType", splitType);

    fetch("api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    }).catch(() => {});

    closeModal("addExpenseModal");
    document.getElementById("addExpenseForm").reset();
    document.getElementById("splitFieldsBox").style.display = "none";

    renderAll();
  }

  // --- Toggle Paid Status ---
  window.toggleSplitStatus = function (splitId) {
    const split = splits.find(s => s.id === splitId);
    if (!split) return;

    split.status = split.status === "PAID" ? "PENDING" : "PAID";
    saveLocal();

    fetch(`api/expenses/toggle?splitId=${splitId}&status=${split.status}`, { method: "POST" }).catch(() => {});
    renderAll();
  };

  // --- Modal Helpers ---
  function openAddModal() {
    const modal = document.getElementById("addExpenseModal");
    if (!modal) return;
    document.getElementById("expenseDate").value = new Date().toISOString().split("T")[0];
    modal.classList.add("active");
  }

  function openProfileModal() {
    const modal = document.getElementById("profileModal");
    if (!modal) return;
    modal.classList.add("active");
    renderCharts();
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
  }

  // --- Render Functions ---
  function renderAll() {
    renderMetrics();
    renderList();
  }

  function renderMetrics() {
    const { totalSpent, toReceive, toPay } = calculateMetrics();

    const spentEl = document.getElementById("metricTotalSpent");
    const recEl = document.getElementById("metricToReceive");
    const payEl = document.getElementById("metricToPay");

    if (spentEl) spentEl.textContent = `₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (recEl) recEl.textContent = `₹${toReceive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (payEl) payEl.textContent = `₹${toPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const pendingRec = splits.filter(s => s.type === "TO_RECEIVE" && s.status === "PENDING").length;
    const pendingPay = splits.filter(s => s.type === "TO_PAY" && s.status === "PENDING").length;

    const badgeRec = document.getElementById("badgeToReceive");
    const badgePay = document.getElementById("badgeToPay");
    const badgeAll = document.getElementById("badgeAll");

    if (badgeRec) badgeRec.textContent = pendingRec;
    if (badgePay) badgePay.textContent = pendingPay;
    if (badgeAll) badgeAll.textContent = expenses.length;
  }

  function renderList() {
    const container = document.getElementById("expenseListContainer");
    if (!container) return;

    if (activeTab === "all") {
      renderAllExpenses(container);
    } else if (activeTab === "to_receive") {
      renderSplits(container, "TO_RECEIVE");
    } else if (activeTab === "to_pay") {
      renderSplits(container, "TO_PAY");
    }
  }

  function renderAllExpenses(container) {
    let filtered = expenses.filter(e => {
      const matchCat = (activeCategory === "All") || (e.category === activeCategory);
      const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery) || (e.splitWith && e.splitWith.toLowerCase().includes(searchQuery));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">No expenses found</div>
          <div class="empty-sub">${searchQuery ? "Try a different search term" : "Click '+ Add expense' to record your first one."}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(e => `
      <div class="expense-item">
        <div class="item-left">
          <div class="cat-icon-badge ${e.category}">${catSvgs[e.category] || catSvgs.Other}</div>
          <div class="item-details">
            <div class="item-title">${escapeHtml(e.title)}</div>
            <div class="item-meta">
              <span>${e.date}</span>
              <span class="item-dot"></span>
              <span>${e.category}</span>
              ${e.splitWith ? `<span class="item-dot"></span><span class="split-tag">Split with ${escapeHtml(e.splitWith)}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="item-right">
          <div class="item-amount">₹${parseFloat(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    `).join("");
  }

  function renderSplits(container, filterType) {
    let filtered = splits.filter(s => {
      if (s.type !== filterType) return false;
      const matchSearch = !searchQuery ||
        s.person.toLowerCase().includes(searchQuery) ||
        (s.expenseTitle && s.expenseTitle.toLowerCase().includes(searchQuery));
      return matchSearch;
    });

    const isReceive = filterType === "TO_RECEIVE";

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">All settled up</div>
          <div class="empty-sub">No pending ${isReceive ? "receivables" : "payments"} recorded.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(s => {
      const isPaid = s.status === "PAID";
      return `
        <div class="expense-item">
          <div class="item-left">
            <div class="cat-icon-badge ${isReceive ? "Travel" : "Utilities"}">${isReceive ? receiveSvg : paySvg}</div>
            <div class="item-details">
              <div class="item-title">${isReceive ? escapeHtml(s.person) + " owes you" : "You owe " + escapeHtml(s.person)}</div>
              <div class="item-meta">
                <span>For: ${escapeHtml(s.expenseTitle || "Expense")}</span>
                <span class="item-dot"></span>
                <span class="status-badge ${isPaid ? "paid" : "pending"}">${isPaid ? "Paid" : "Pending"}</span>
              </div>
            </div>
          </div>
          <div class="item-right">
            <div class="item-amount">₹${parseFloat(s.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <button class="btn-toggle-paid ${isPaid ? "is-paid" : ""}" onclick="toggleSplitStatus(${s.id})">
              ${isPaid ? "Paid" : "Mark as paid"}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- Profile Spending Analytics & Charts ---
  function renderCharts() {
    if (typeof Chart === "undefined") {
      return;
    }

    const monthFilter = document.getElementById("analyticsMonthSelect")?.value || "ALL";
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#94A3B8" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

    let dataset = expenses;
    if (monthFilter !== "ALL") {
      dataset = expenses.filter(e => e.date && e.date.startsWith(monthFilter));
    }

    const categories = ["Food", "Travel", "Utilities", "Entertainment", "Other"];
    const categoryTotals = { Food: 0, Travel: 0, Utilities: 0, Entertainment: 0, Other: 0 };
    dataset.forEach(e => {
      const cat = categories.includes(e.category) ? e.category : "Other";
      categoryTotals[cat] += parseFloat(e.amount || 0);
    });

    const breakdownList = document.getElementById("profileCategoryBreakdown");
    if (breakdownList) {
      breakdownList.innerHTML = categories.map(cat => `
        <div class="breakdown-row">
          <div class="breakdown-cat-name">${cat}</div>
          <div class="breakdown-cat-amount">₹${categoryTotals[cat].toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      `).join("");
    }

    const ctxCat = document.getElementById("categoryChart")?.getContext("2d");
    if (ctxCat) {
      if (categoryChartInstance) categoryChartInstance.destroy();
      categoryChartInstance = new Chart(ctxCat, {
        type: "doughnut",
        data: {
          labels: categories,
          datasets: [{
            data: categories.map(c => categoryTotals[c]),
            backgroundColor: [
              "#2563EB", // Primary Blue
              "#38BDF8", // Sky Blue
              "#4F46E5", // Indigo
              "#0284C7", // Slate Blue
              "#64748B"  // Slate Neutral
            ],
            borderWidth: 2,
            borderColor: isDark ? "#10192E" : "#FFFFFF"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: textColor, font: { family: "Arimo", size: 12 } }
            }
          }
        }
      });
    }

    const monthlyTotals = {};
    expenses.forEach(e => {
      if (e.date) {
        const monthKey = e.date.substring(0, 7);
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(e.amount || 0);
      }
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    const monthLabels = sortedMonths.map(m => {
      const d = new Date(m + "-01");
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    });

    const ctxMonth = document.getElementById("monthlyChart")?.getContext("2d");
    if (ctxMonth) {
      if (monthlyChartInstance) monthlyChartInstance.destroy();
      monthlyChartInstance = new Chart(ctxMonth, {
        type: "bar",
        data: {
          labels: monthLabels.length > 0 ? monthLabels : ["Current"],
          datasets: [{
            label: "Total spent (₹)",
            data: sortedMonths.length > 0 ? sortedMonths.map(m => monthlyTotals[m]) : [0],
            backgroundColor: isDark ? "#3B82F6" : "#2563EB",
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: "Arimo", size: 12 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: "Arimo", size: 12 } }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();