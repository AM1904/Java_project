package com.expenseTracker.db;

import com.expenseTracker.model.User;
import com.expenseTracker.exception.AuthenticationFailedException;
import com.expenseTracker.exception.UserAlreadyExistsException;
import com.expenseTracker.exception.ValidationException;

import java.sql.*;

/**
 * UserDAO.java
 * ------------
 * Phase 4: Data Access Object — all SQL operations for the users table.
 *
 * Methods:
 *   registerUser()     — validate, check duplicate, INSERT
 *   authenticateUser() — validate, SELECT, compare password
 */
public class UserDAO {

    // ── Registration ──────────────────────────────────────────────────────────

    /**
     * Validates input, checks for duplicates, and inserts a new user row.
     *
     * @param username raw username from the form
     * @param password raw password from the form
     * @return the newly created User object (with the auto-generated ID)
     * @throws ValidationException       if username/password rules are violated
     * @throws UserAlreadyExistsException if the username is already taken
     * @throws SQLException              if a database error occurs
     */
    public User registerUser(String username, String password)
            throws ValidationException, UserAlreadyExistsException, SQLException {

        // ── Server-side validation (Phase 4) ────────────────────────────────
        if (username == null || username.trim().isEmpty())
            throw new ValidationException("Username cannot be empty.");
        if (password == null || password.trim().isEmpty())
            throw new ValidationException("Password cannot be empty.");
        if (password.trim().length() < 6)
            throw new ValidationException("Password must contain at least 6 characters.");

        String u = username.trim();
        String p = password.trim();

        try (Connection conn = DatabaseConnection.getConnection()) {

            // ── Duplicate check ─────────────────────────────────────────────
            String checkSQL = "SELECT id FROM users WHERE LOWER(username) = LOWER(?)";
            try (PreparedStatement ps = conn.prepareStatement(checkSQL)) {
                ps.setString(1, u);
                ResultSet rs = ps.executeQuery();
                if (rs.next())
                    throw new UserAlreadyExistsException("Username '" + u + "' already exists.");
            }

            // ── INSERT ──────────────────────────────────────────────────────
            String insertSQL = "INSERT INTO users (username, password) VALUES (?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertSQL, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, u);
                ps.setString(2, p);
                ps.executeUpdate();
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next()) {
                    return new User(keys.getInt(1), u, p);
                }
            }
        }
        throw new SQLException("Registration failed unexpectedly.");
    }

    // ── Authentication ────────────────────────────────────────────────────────

    /**
     * Validates input, looks up the user by username, and verifies the password.
     *
     * @param username raw username from the login form
     * @param password raw password from the login form
     * @return the authenticated User object
     * @throws ValidationException        if input is empty/invalid
     * @throws AuthenticationFailedException if credentials do not match
     * @throws SQLException               if a database error occurs
     */
    public User authenticateUser(String username, String password)
            throws ValidationException, AuthenticationFailedException, SQLException {

        if (username == null || username.trim().isEmpty())
            throw new ValidationException("Username cannot be empty.");
        if (password == null || password.trim().isEmpty())
            throw new ValidationException("Password cannot be empty.");

        String u = username.trim();
        String p = password.trim();

        try (Connection conn = DatabaseConnection.getConnection()) {
            String sql = "SELECT id, username, password FROM users WHERE LOWER(username) = LOWER(?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, u);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    String stored = rs.getString("password");
                    // Plain-text comparison (Phase 4 — hashing added in a later phase)
                    if (stored.equals(p)) {
                        return new User(rs.getInt("id"), rs.getString("username"), stored);
                    }
                }
            }
        }
        throw new AuthenticationFailedException("Invalid username or password.");
    }
}