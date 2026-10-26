/**
 * app.js - SplitIt Application & Analytics Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initRegisterForm();
  initLoginForm();
  initDashboard();
  initAccountPage();
});

// Storage Keys
const USERS_KEY = "splitit_users";
const SESSION_KEY = "splitit_active_session";
const EXPENSES_KEY = "splitit_expenses";
const THEME_KEY = "splitit_theme";

/**
 * ----------------------------------------------------
 * Theme Management (Dark Obsidian vs Light Mode)
 * ----------------------------------------------------
 */
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButtonText(savedTheme);

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      updateThemeButtonText(newTheme);
      // Re-render charts if on account page
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (sessionData && document.getElementById("categoryPieChart")) {
        renderCharts(JSON.parse(sessionData).username);
      }
    });
  }
}

function updateThemeButtonText(theme) {
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
  }
}

/**
 * ----------------------------------------------------
 * Data Storage Helpers (Indian Rupee Currency ₹)
 * ----------------------------------------------------
 */
function getStoredUsers() {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    const initial = [
      { userId: 1, username: "rahul" },
      { userId: 2, username: "ananya" }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function getStoredExpenses() {
  const data = localStorage.getItem(EXPENSES_KEY);
  if (!data) {
    const initialExpenses = [
      {
        id: 101,
        description: "Team Dinner at Restaurant",
        amount: 1450.00,
        paidBy: "ananya",
        splitWith: "rahul",
        category: "food",
        status: "unpaid",
        month: "Oct",
        date: "Today"
      },
      {
        id: 102,
        description: "Cab Ride to Office",
        amount: 380.00,
        paidBy: "rahul",
        splitWith: "ananya",
        category: "travel",
        status: "paid",
        month: "Oct",
        date: "Yesterday"
      },
      {
        id: 103,
        description: "Movie Tickets",
        amount: 700.00,
        paidBy: "ananya",
        splitWith: "rahul",
        category: "entertainment",
        status: "unpaid",
        month: "Sep",
        date: "25 Sep"
      },
      {
        id: 104,
        description: "Electricity Bill Share",
        amount: 1200.00,
        paidBy: "rahul",
        splitWith: "ananya",
        category: "bills",
        status: "paid",
        month: "Aug",
        date: "15 Aug"
      }
    ];
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(initialExpenses));
    return initialExpenses;
  }
  return JSON.parse(data);
}

function saveExpenses(expenses) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

function showAlert(message, type = "error") {
  const alertEl = document.getElementById("alertBanner");
  if (!alertEl) return;
  alertEl.className = `alert alert-${type} show`;
  alertEl.textContent = message;
}

/**
 * ----------------------------------------------------
 * Registration & Login Flows
 * ----------------------------------------------------
 */
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const userErr = Validation.validateUsername(username);
    if (userErr) return showAlert(userErr, "error");

    const passErr = Validation.validatePassword(password);
    if (passErr) return showAlert(passErr, "error");

    const matchErr = Validation.validatePasswordMatch(password, confirmPassword);
    if (matchErr) return showAlert(matchErr, "error");

    const users = getStoredUsers();
    const trimmed = username.trim();
    if (users.some(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
      return showAlert(`Username '${trimmed}' already exists.`, "error");
    }

    const newUser = {
      userId: users.length + 1,
      username: trimmed,
      password: password.trim()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    showAlert("Registration successful! Redirecting to login...", "success");
    setTimeout(() => { window.location.href = "login.html"; }, 1000);
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const userErr = Validation.validateUsername(username);
    if (userErr) return showAlert(userErr, "error");

    const passErr = Validation.validatePassword(password);
    if (passErr) return showAlert(passErr, "error");

    const users = getStoredUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
    );

    if (!found) {
      return showAlert("Invalid username or password.", "error");
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(found));
    showAlert("Login successful! Loading dashboard...", "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
  });
}

/**
 * ----------------------------------------------------
 * Main Dashboard Functions
 * ----------------------------------------------------
 */
function initDashboard() {
  const dashboard = document.getElementById("dashboardContent");
  if (!dashboard) return;

  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) {
    window.location.href = "login.html";
    return;
  }

  const currentUser = JSON.parse(sessionData);

  // Set Profile Link
  document.getElementById("userNameDisplay").textContent = currentUser.username;
  document.getElementById("userAvatarInitial").textContent = currentUser.username.charAt(0).toUpperCase();

  // Populate "Split With" dropdown
  const splitSelect = document.getElementById("expenseSplitWith");
  if (splitSelect) {
    const users = getStoredUsers().filter(u => u.username.toLowerCase() !== currentUser.username.toLowerCase());
    splitSelect.innerHTML = users.map(u => `<option value="${u.username}">${u.username}</option>`).join("");
    if (users.length === 0) {
      splitSelect.innerHTML = `<option value="friend">Friend</option>`;
    }
  }

  renderExpenses(currentUser.username);

  // Add Expense Handler
  const addExpenseForm = document.getElementById("addExpenseForm");
  if (addExpenseForm) {
    addExpenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const desc = document.getElementById("expenseDesc").value.trim();
      const amount = parseFloat(document.getElementById("expenseAmount").value);
      const splitWith = document.getElementById("expenseSplitWith").value;
      const category = document.getElementById("expenseCategory").value;

      if (!desc || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid description and amount.");
        return;
      }

      const expenses = getStoredExpenses();
      const newExpense = {
        id: Date.now(),
        description: desc,
        amount: amount,
        paidBy: currentUser.username,
        splitWith: splitWith,
        category: category,
        status: "unpaid",
        month: "Oct",
        date: "Just now"
      };

      expenses.unshift(newExpense);
      saveExpenses(expenses);

      addExpenseForm.reset();
      renderExpenses(currentUser.username);
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

/**
 * Render Dashboard Expenses & Calculate Balances (in ₹)
 */
function renderExpenses(currentUsername) {
  const expenses = getStoredExpenses();
  const listEl = document.getElementById("expenseList");
  if (!listEl) return;

  let totalExpenses = 0;
  let youOwe = 0;
  let youAreOwed = 0;

  if (expenses.length === 0) {
    listEl.innerHTML = `<div class="empty-state">No expenses recorded yet.</div>`;
  } else {
    listEl.innerHTML = expenses.map(item => {
      const isPaidByMe = item.paidBy.toLowerCase() === currentUsername.toLowerCase();
      const isSplitWithMe = item.splitWith.toLowerCase() === currentUsername.toLowerCase();
      const splitShare = item.amount / 2;

      if (isPaidByMe) {
        totalExpenses += item.amount;
        if (item.status === "unpaid") {
          youAreOwed += splitShare;
        }
      } else if (isSplitWithMe) {
        if (item.status === "unpaid") {
          youOwe += splitShare;
        }
      }

      const isUnpaidDebtIOwe = isSplitWithMe && item.status === "unpaid";

      return `
        <div class="expense-card">
          <div>
            <div class="expense-title">${item.description}</div>
            <div class="expense-meta">
              Paid by ${item.paidBy === currentUsername ? "You" : item.paidBy} • Split with ${item.splitWith} • ${item.category.toUpperCase()}
            </div>
          </div>
          <div class="expense-right">
            <div class="expense-amount">₹${item.amount.toFixed(2)}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span class="badge ${item.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}">
                ${item.status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
              ${isUnpaidDebtIOwe ? `<button onclick="markAsPaid(${item.id})" class="btn btn-sm btn-success-sm">Mark as Paid</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Update Summary Stats Cards
  document.getElementById("statTotalExpenses").textContent = `₹${totalExpenses.toFixed(2)}`;
  document.getElementById("statYouOwe").textContent = `₹${youOwe.toFixed(2)}`;
  document.getElementById("statYouAreOwed").textContent = `₹${youAreOwed.toFixed(2)}`;
}

window.markAsPaid = function(expenseId) {
  const expenses = getStoredExpenses();
  const index = expenses.findIndex(e => e.id === expenseId);
  if (index !== -1) {
    expenses[index].status = "paid";
    saveExpenses(expenses);

    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (sessionData) {
      const currentUser = JSON.parse(sessionData);
      renderExpenses(currentUser.username);
    }
  }
};

/**
 * ----------------------------------------------------
 * User Account Analytics Page & Charts
 * ----------------------------------------------------
 */
let pieChartInstance = null;
let barChartInstance = null;

function initAccountPage() {
  const accountContent = document.getElementById("accountContent");
  if (!accountContent) return;

  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) {
    window.location.href = "login.html";
    return;
  }

  const currentUser = JSON.parse(sessionData);

  document.getElementById("accountUsername").textContent = currentUser.username;
  document.getElementById("accountAvatar").textContent = currentUser.username.charAt(0).toUpperCase();

  renderAccountTotals(currentUser.username);
  renderCharts(currentUser.username);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

function renderAccountTotals(currentUsername) {
  const expenses = getStoredExpenses();
  let totalExpenses = 0;
  let youOwe = 0;
  let youAreOwed = 0;

  expenses.forEach(item => {
    const isPaidByMe = item.paidBy.toLowerCase() === currentUsername.toLowerCase();
    const isSplitWithMe = item.splitWith.toLowerCase() === currentUsername.toLowerCase();
    const splitShare = item.amount / 2;

    if (isPaidByMe) {
      totalExpenses += item.amount;
      if (item.status === "unpaid") youAreOwed += splitShare;
    } else if (isSplitWithMe) {
      if (item.status === "unpaid") youOwe += splitShare;
    }
  });

  document.getElementById("accountTotalExpenses").textContent = `₹${totalExpenses.toFixed(2)}`;
  document.getElementById("accountYouOwe").textContent = `₹${youOwe.toFixed(2)}`;
  document.getElementById("accountYouAreOwed").textContent = `₹${youAreOwed.toFixed(2)}`;
}

/**
 * Render Category Pie Chart & Monthly Bar Chart using Chart.js
 */
function renderCharts(currentUsername) {
  const expenses = getStoredExpenses();
  const myExpenses = expenses.filter(
    e => e.paidBy.toLowerCase() === currentUsername.toLowerCase() || e.splitWith.toLowerCase() === currentUsername.toLowerCase()
  );

  // 1. Calculate Category Totals
  const categoryTotals = { Food: 0, Travel: 0, Entertainment: 0, Bills: 0, General: 0 };
  myExpenses.forEach(e => {
    const cat = e.category.charAt(0).toUpperCase() + e.category.slice(1);
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += e.amount;
    } else {
      categoryTotals.General += e.amount;
    }
  });

  // 2. Calculate Monthly Totals
  const monthTotals = { Aug: 0, Sep: 0, Oct: 0 };
  myExpenses.forEach(e => {
    const m = e.month || "Oct";
    if (monthTotals[m] !== undefined) {
      monthTotals[m] += e.amount;
    }
  });

  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const textColor = isDark ? "#d1d5db" : "#374151";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // Render Pie / Doughnut Chart
  const pieCtx = document.getElementById("categoryPieChart");
  if (pieCtx && typeof Chart !== "undefined") {
    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Inter' } } }
        }
      }
    });
  }

  // Render Monthly Bar Chart
  const barCtx = document.getElementById("monthlyBarChart");
  if (barCtx && typeof Chart !== "undefined") {
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: Object.keys(monthTotals),
        datasets: [{
          label: "Expenses (₹)",
          data: Object.values(monthTotals),
          backgroundColor: "#2563eb",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        },
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Inter' } } }
        }
      }
    });
  }
}