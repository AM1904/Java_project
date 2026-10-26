<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String sessionUser = (String) session.getAttribute("username");
    Integer sessionId = (Integer) session.getAttribute("userId");
    if (sessionUser == null) {
        response.sendRedirect("login.html");
        return;
    }
    String initial = sessionUser.substring(0, 1).toUpperCase();
%>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Split It - Track and split expenses easily.">
  <title>Dashboard - Split It</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Top Navigation Bar -->
  <header class="app-header">
    <div class="nav-container">
            <a href="dashboard.jsp" class="brand-wrap">
        <div class="logo-circle-wrap">
          <img src="images/split_it_logo.png" alt="Split It" class="navbar-logo-img">
        </div>
        <span class="brand-name-text">Split It</span>
      </a>

      <div class="nav-actions">
        <!-- User Profile Trigger (opens spending analytics & graphs) -->
        <button class="user-profile-btn" id="userProfileBtn" title="View profile and analytics">
          <div class="user-avatar-circle"><%= initial %></div>
          <span><%= sessionUser %></span>
        </button>

        <!-- Dark / Light Mode Switcher (Clean SVG, No Emojis) -->
        <button class="theme-toggle-btn" id="themeToggleBtn" title="Toggle theme">
          <svg class="theme-icon" id="themeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span id="themeToggleText">Dark mode</span>
        </button>

        <!-- Logout -->
        <a href="logout" class="logout-btn" id="logoutBtn" title="Log out">
          Sign out
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Layout -->
  <main class="main-wrapper">

    <!-- Top Key Metrics -->
    <section class="metrics-grid" aria-label="Key expense metrics">
      <div class="metric-card">
        <div class="metric-card-header">
          <span class="metric-label">Total Expenses</span>
          <span class="metric-tag blue">Overall</span>
        </div>
        <div class="metric-value" id="metricTotalSpent">â‚¹0.00</div>
        <div class="metric-sub">Total logged spend</div>
      </div>

      <div class="metric-card">
        <div class="metric-card-header">
          <span class="metric-label">You are to Receive</span>
          <span class="metric-tag green">Incoming</span>
        </div>
        <div class="metric-value" id="metricToReceive" style="color:var(--green-main)">â‚¹0.00</div>
        <div class="metric-sub">Pending receivables from others</div>
      </div>

      <div class="metric-card">
        <div class="metric-card-header">
          <span class="metric-label">You Need to Pay</span>
          <span class="metric-tag amber">Outgoing</span>
        </div>
        <div class="metric-value" id="metricToPay" style="color:var(--amber-main)">â‚¹0.00</div>
        <div class="metric-sub">Pending payables to others</div>
      </div>
    </section>

    <!-- Control Bar (Tabs + Search + Add Button) -->
    <div class="action-bar">
      <!-- 3 View Tabs: All, To Receive, To Pay -->
      <div class="view-tabs" role="tablist">
        <button class="tab-btn active" data-tab="all" role="tab">
          <span>All expenses</span>
          <span class="tab-badge" id="badgeAll">0</span>
        </button>
        <button class="tab-btn" data-tab="to_receive" role="tab">
          <span>You are to receive</span>
          <span class="tab-badge green" id="badgeToReceive">0</span>
        </button>
        <button class="tab-btn" data-tab="to_pay" role="tab">
          <span>You need to pay</span>
          <span class="tab-badge amber" id="badgeToPay">0</span>
        </button>
      </div>

      <!-- Search & Add Actions -->
      <div class="right-actions">
        <div class="search-box">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="expenseSearch" class="search-input" placeholder="Search by title or person...">
        </div>
        <button class="btn-primary" id="openAddExpenseBtn">
          <span>+ Add expense</span>
        </button>
      </div>
    </div>

    <!-- Category Filter Pills (No emojis) -->
    <div class="category-filters" aria-label="Filter expenses by category">
      <button class="filter-pill active" data-category="All">All</button>
      <button class="filter-pill" data-category="Food">Food</button>
      <button class="filter-pill" data-category="Travel">Travel</button>
      <button class="filter-pill" data-category="Utilities">Utilities</button>
      <button class="filter-pill" data-category="Entertainment">Entertainment</button>
      <button class="filter-pill" data-category="Other">Other</button>
    </div>

    <!-- Expense List Container -->
    <div class="expense-list" id="expenseListContainer">
      <!-- Dynamically populated by dashboard.js -->
    </div>

  </main>

  <!-- ================= ADD EXPENSE MODAL ================= -->
  <div class="modal-overlay" id="addExpenseModal" role="dialog" aria-modal="true" aria-labelledby="addModalTitle">
    <div class="modal-card">
      <div class="modal-header">
        <h2 class="modal-title" id="addModalTitle">Add expense</h2>
        <button class="modal-close-btn" id="addModalClose" aria-label="Close modal">&times;</button>
      </div>

      <form id="addExpenseForm">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="expenseTitle">Description</label>
            <input type="text" id="expenseTitle" class="form-input" placeholder="e.g. Dinner, Taxi fare, Electricity" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="expenseAmount">Total amount (â‚¹)</label>
              <input type="number" id="expenseAmount" class="form-input" placeholder="0.00" step="0.01" min="1" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="expenseCategory">Category</label>
              <select id="expenseCategory" class="form-select" required>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="expenseDate">Date</label>
            <input type="date" id="expenseDate" class="form-input" required>
          </div>

          <!-- Split Checkbox & Details -->
          <div class="split-box">
            <label class="split-toggle-row">
              <span class="split-toggle-title">Split this expense</span>
              <input type="checkbox" id="isSplitCheckbox" style="width:16px;height:16px;cursor:pointer;">
            </label>

            <div class="split-fields" id="splitFieldsBox" style="display:none;">
              <div class="split-type-radios">
                <label>
                  <input type="radio" name="splitType" value="TO_RECEIVE" checked>
                  <span>I paid, others owe me</span>
                </label>
                <label>
                  <input type="radio" name="splitType" value="TO_PAY">
                  <span>Someone else paid, I owe them</span>
                </label>
              </div>

              <div>
                <label class="form-label" for="splitPeople">Split with (comma separated names)</label>
                <input type="text" id="splitPeople" class="form-input" placeholder="e.g. Rahul, Neha, Sam">
              </div>

              <div class="split-preview-chip" id="splitPreviewChip">
                Enter amount and names to calculate split
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="addModalCancel">Cancel</button>
          <button type="submit" class="btn-primary">Save expense</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= USER PROFILE & ANALYTICS MODAL ================= -->
  <div class="modal-overlay" id="profileModal" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
    <div class="modal-card profile-modal-card">
      <div class="modal-header">
        <h2 class="modal-title" id="profileModalTitle">Spending Analytics</h2>
        <button class="modal-close-btn" id="profileModalClose" aria-label="Close modal">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Profile Banner -->
        <div class="profile-top-info">
          <div class="profile-avatar-large"><%= initial %></div>
          <div class="profile-details-text">
            <h3><%= sessionUser %></h3>
            <p>Expense and split summary</p>
          </div>
        </div>

        <!-- Month Filter Row -->
        <div class="analytics-filter-row">
          <span class="chart-title">Spending overview</span>
          <select id="analyticsMonthSelect" class="form-select" style="width:170px;padding:6px 12px;font-size:13px;">
            <option value="ALL">All months</option>
            <option value="2026-10" selected>October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>
        </div>

        <!-- 2 Side-by-side Charts -->
        <div class="charts-grid">
          <div class="chart-card">
            <span class="chart-title">By category</span>
            <div class="chart-canvas-wrap">
              <canvas id="categoryChart"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <span class="chart-title">Monthly trend</span>
            <div class="chart-canvas-wrap">
              <canvas id="monthlyChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Category Breakdown Values -->
        <span class="chart-title" style="display:block;margin-bottom:8px;">Category totals</span>
        <div class="category-breakdown-list" id="profileCategoryBreakdown">
          <!-- Populated by dashboard.js -->
        </div>
      </div>
    </div>
  </div>

  <!-- Local Chart.js + Dashboard Logic -->
  <script src="js/chart.min.js"></script>
  <script src="js/dashboard.js"></script>
</body>
</html>