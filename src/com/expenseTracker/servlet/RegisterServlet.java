package com.expenseTracker.servlet;

import com.expenseTracker.db.UserDAO;
import com.expenseTracker.model.User;
import com.expenseTracker.exception.UserAlreadyExistsException;
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
 * RegisterServlet.java
 * --------------------
 * Phase 4: Handles user registration via HTTP POST.
 *
 * GET  /register  â†’  redirect to register.html
 * POST /register  â†’  validate + insert into DB + create session + redirect to dashboard
 *
 * On failure: redirect back to register.html with ?error=<message>
 */
@WebServlet(name = "RegisterServlet", urlPatterns = "/register")
public class RegisterServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // If already logged in, skip to dashboard
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("username") != null) {
            resp.sendRedirect("dashboard.jsp");
            return;
        }
        resp.sendRedirect("register.html");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        UserDAO dao = new UserDAO();

        try {
            // Register user â€” DAO handles validation + duplicate check + INSERT
            User newUser = dao.registerUser(username, password);

            // Phase 4: Create HttpSession for the registered user
            HttpSession session = req.getSession();          // creates new session
            session.setAttribute("username", newUser.getUsername());
            session.setAttribute("userId",   newUser.getUserId());
            session.setMaxInactiveInterval(30 * 60);         // 30 minutes

            // Redirect to dashboard
            resp.sendRedirect("dashboard.jsp");

        } catch (ValidationException e) {
            redirectWithError(resp, "register.html", e.getMessage());
        } catch (UserAlreadyExistsException e) {
            redirectWithError(resp, "register.html", e.getMessage());
        } catch (SQLException e) {
            redirectWithError(resp, "register.html", "A server error occurred. Please try again.");
        }
    }

    /** Encodes an error message and redirects back to the given page. */
    private void redirectWithError(HttpServletResponse resp, String page, String msg)
            throws IOException {
        String encoded = URLEncoder.encode(msg, StandardCharsets.UTF_8);
        resp.sendRedirect(page + "?error=" + encoded);
    }
}