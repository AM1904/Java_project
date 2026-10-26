package com.expenseTracker.servlet;

import com.expenseTracker.db.UserDAO;
import com.expenseTracker.model.User;
import com.expenseTracker.exception.AuthenticationFailedException;
import com.expenseTracker.exception.ValidationException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;

/**
 * LoginServlet.java
 * -----------------
 * Phase 4: Handles user login via HTTP POST.
 *
 * GET  /login  â†’  redirect to login.html (or dashboard if already logged in)
 * POST /login  â†’  authenticate against DB + create session + redirect to dashboard
 *
 * On failure: redirect back to login.html with ?error=<message>
 */
@WebServlet(name = "LoginServlet", urlPatterns = "/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // If already authenticated, go straight to dashboard
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("username") != null) {
            resp.sendRedirect("dashboard.jsp");
            return;
        }
        resp.sendRedirect("login.html");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        UserDAO dao = new UserDAO();

        try {
            // Authenticate â€” DAO queries DB and compares password
            User user = dao.authenticateUser(username, password);

            // Phase 4: Invalidate old session (prevents session fixation)
            HttpSession old = req.getSession(false);
            if (old != null) old.invalidate();

            // Create a fresh session and store user info
            HttpSession session = req.getSession(true);
            session.setAttribute("username", user.getUsername());
            session.setAttribute("userId",   user.getUserId());
            session.setMaxInactiveInterval(30 * 60); // 30 minutes

            resp.sendRedirect("dashboard.jsp");

        } catch (ValidationException e) {
            redirectWithError(resp, e.getMessage());
        } catch (AuthenticationFailedException e) {
            redirectWithError(resp, e.getMessage());
        } catch (SQLException e) {
            redirectWithError(resp, "A server error occurred. Please try again.");
        }
    }

    private void redirectWithError(HttpServletResponse resp, String msg) throws IOException {
        String encoded = URLEncoder.encode(msg, StandardCharsets.UTF_8);
        resp.sendRedirect("login.html?error=" + encoded);
    }
}