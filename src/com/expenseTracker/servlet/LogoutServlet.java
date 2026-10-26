package com.expenseTracker.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * LogoutServlet.java
 * ------------------
 * Phase 4: Invalidates the user session and redirects to login page.
 *
 * GET /logout â†’ invalidate HttpSession â†’ redirect to login.html
 */
@WebServlet(name = "LogoutServlet", urlPatterns = "/logout")
public class LogoutServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        // Phase 4: Invalidate the session â€” user is fully logged out
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Redirect to login with a success message
        resp.sendRedirect("login.html?message=You+have+been+logged+out+successfully.");
    }
}