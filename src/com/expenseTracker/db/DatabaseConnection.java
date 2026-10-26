package com.expenseTracker.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DatabaseConnection.java
 * -----------------------
 * Phase 4: Provides a JDBC connection to the MySQL database.
 *
 * Change DB_PASSWORD to match your MySQL installation before deploying.
 */
public class DatabaseConnection {

    private static final String URL = "jdbc:mysql://localhost:3306/expense_tracker" +
            "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";

    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "rootroot"; // change to your MySQL password

    // Load MySQL JDBC driver once when the class is first used
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(
                    "MySQL JDBC Driver not found. Add mysql-connector-java.jar to WEB-INF/lib/", e);
        }
    }

    /**
     * Returns a new database connection.
     * Callers must close this connection (use try-with-resources).
     *
     * @return a live JDBC Connection
     * @throws SQLException if the database is unreachable or credentials are wrong
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, DB_USER, DB_PASSWORD);
    }
}