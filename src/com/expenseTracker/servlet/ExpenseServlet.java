package com.expenseTracker.servlet;

import com.expenseTracker.db.ExpenseDAO;
import com.expenseTracker.model.Expense;
import com.expenseTracker.model.Split;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet(name = "ExpenseServlet", urlPatterns = {"/api/expenses", "/api/expenses/toggle"})
public class ExpenseServlet extends HttpServlet {

    private final ExpenseDAO expenseDAO = new ExpenseDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\":false,\"error\":\"Not authenticated\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");

        try {
            List<Expense> expenses = expenseDAO.getExpensesByUser(userId);
            List<Split> splits = expenseDAO.getSplitsByUser(userId);

            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,\"expenses\":[");
            for (int i = 0; i < expenses.size(); i++) {
                Expense e = expenses.get(i);
                if (i > 0) sb.append(",");
                sb.append("{")
                  .append("\"id\":").append(e.getId()).append(",")
                  .append("\"title\":\"").append(escapeJson(e.getTitle())).append("\",")
                  .append("\"amount\":").append(e.getAmount()).append(",")
                  .append("\"category\":\"").append(escapeJson(e.getCategory())).append("\",")
                  .append("\"splitWith\":\"").append(escapeJson(e.getSplitWith())).append("\",")
                  .append("\"date\":\"").append(e.getExpenseDate()).append("\"")
                  .append("}");
            }
            sb.append("],\"splits\":[");
            for (int i = 0; i < splits.size(); i++) {
                Split s = splits.get(i);
                if (i > 0) sb.append(",");
                sb.append("{")
                  .append("\"id\":").append(s.getId()).append(",")
                  .append("\"expenseId\":").append(s.getExpenseId()).append(",")
                  .append("\"person\":\"").append(escapeJson(s.getPersonName())).append("\",")
                  .append("\"amount\":").append(s.getAmount()).append(",")
                  .append("\"type\":\"").append(s.getType()).append("\",")
                  .append("\"status\":\"").append(s.getStatus()).append("\",")
                  .append("\"expenseTitle\":\"").append(escapeJson(s.getExpenseTitle() != null ? s.getExpenseTitle() : "")).append("\"")
                  .append("}");
            }
            sb.append("]}");
            out.print(sb.toString());
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false,\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\":false,\"error\":\"Not authenticated\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String uri = req.getRequestURI();

        try {
            if (uri.endsWith("/toggle")) {
                int splitId = Integer.parseInt(req.getParameter("splitId"));
                String newStatus = req.getParameter("status"); // PAID or PENDING
                boolean ok = expenseDAO.updateSplitStatus(splitId, userId, newStatus);
                out.print("{\"success\":" + ok + "}");
                return;
            }

            // Normal add expense
            String title = req.getParameter("title");
            double amount = Double.parseDouble(req.getParameter("amount"));
            String category = req.getParameter("category");
            String splitWith = req.getParameter("splitWith");
            String date = req.getParameter("date");
            String splitType = req.getParameter("splitType"); // TO_RECEIVE or TO_PAY

            if (title == null || title.trim().isEmpty()) {
                out.print("{\"success\":false,\"error\":\"Title required\"}");
                return;
            }

            int expenseId = expenseDAO.addExpense(userId, title.trim(), amount, category, splitWith, date);

            // If splitWith is provided, create splits
            if (splitWith != null && !splitWith.trim().isEmpty()) {
                String[] people = splitWith.split(",");
                int totalPeople = people.length + (splitType.equals("TO_RECEIVE") ? 1 : 0);
                double perPerson = Math.round((amount / totalPeople) * 100.0) / 100.0;

                for (String p : people) {
                    String personName = p.trim();
                    if (!personName.isEmpty()) {
                        expenseDAO.addSplit(expenseId, userId, personName, perPerson, splitType, "PENDING");
                    }
                }
            }

            out.print("{\"success\":true,\"id\":" + expenseId + "}");
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false,\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}