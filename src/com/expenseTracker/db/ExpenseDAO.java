package com.expenseTracker.db;

import com.expenseTracker.model.Expense;
import com.expenseTracker.model.Split;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ExpenseDAO {

    public int addExpense(int userId, String title, double amount, String category, String splitWith, String expenseDate) throws SQLException {
        String sql = "INSERT INTO expenses (user_id, title, amount, category, split_with, expense_date) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, userId);
            ps.setString(2, title);
            ps.setDouble(3, amount);
            ps.setString(4, category);
            ps.setString(5, splitWith != null ? splitWith : "");
            ps.setString(6, (expenseDate != null && !expenseDate.isEmpty()) ? expenseDate : new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date()));
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return -1;
    }

    public void addSplit(int expenseId, int userId, String personName, double amount, String type, String status) throws SQLException {
        String sql = "INSERT INTO splits (expense_id, user_id, person_name, amount, type, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, expenseId);
            ps.setInt(2, userId);
            ps.setString(3, personName);
            ps.setDouble(4, amount);
            ps.setString(5, type);
            ps.setString(6, status != null ? status : "PENDING");
            ps.executeUpdate();
        }
    }

    public List<Expense> getExpensesByUser(int userId) throws SQLException {
        List<Expense> list = new ArrayList<>();
        String sql = "SELECT id, user_id, title, amount, category, split_with, expense_date FROM expenses WHERE user_id = ? ORDER BY expense_date DESC, id DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Expense e = new Expense(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("title"),
                        rs.getDouble("amount"),
                        rs.getString("category"),
                        rs.getString("split_with"),
                        rs.getString("expense_date")
                    );
                    list.add(e);
                }
            }
        }
        return list;
    }

    public List<Split> getSplitsByUser(int userId) throws SQLException {
        List<Split> list = new ArrayList<>();
        String sql = "SELECT s.id, s.expense_id, s.user_id, s.person_name, s.amount, s.type, s.status, e.title " +
                     "FROM splits s LEFT JOIN expenses e ON s.expense_id = e.id " +
                     "WHERE s.user_id = ? ORDER BY s.id DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Split s = new Split(
                        rs.getInt("id"),
                        rs.getInt("expense_id"),
                        rs.getInt("user_id"),
                        rs.getString("person_name"),
                        rs.getDouble("amount"),
                        rs.getString("type"),
                        rs.getString("status")
                    );
                    s.setExpenseTitle(rs.getString("title"));
                    list.add(s);
                }
            }
        }
        return list;
    }

    public boolean updateSplitStatus(int splitId, int userId, String status) throws SQLException {
        String sql = "UPDATE splits SET status = ? WHERE id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, splitId);
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        }
    }
}