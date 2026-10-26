package com.expenseTracker.service;

import com.expenseTracker.model.User;
import com.expenseTracker.exception.ValidationException;
import com.expenseTracker.exception.UserAlreadyExistsException;
import com.expenseTracker.exception.AuthenticationFailedException;

/**
 * UserOperations.java
 * -------------------
 * Interface defining contract for user management, validation, and authentication.
 */
public interface UserOperations {

    /**
     * Validates username rules.
     * @throws ValidationException if username is invalid
     */
    void validateUsername(String username) throws ValidationException;

    /**
     * Validates password rules.
     * @throws ValidationException if password is invalid
     */
    void validatePassword(String password) throws ValidationException;

    /**
     * Checks if username is already taken.
     */
    boolean isUsernameTaken(String username);

    /**
     * Registers a new user.
     * @throws ValidationException if input format is invalid
     * @throws UserAlreadyExistsException if username is taken
     */
    User registerUser(String username, String password) throws ValidationException, UserAlreadyExistsException;

    /**
     * Authenticates an existing user with username and password.
     * @throws ValidationException if credentials format is invalid
     * @throws AuthenticationFailedException if credentials do not match
     */
    User authenticateUser(String username, String password) throws ValidationException, AuthenticationFailedException;

    /**
     * Displays all registered users.
     */
    void displayAllUsers();

    /**
     * Returns total user count.
     */
    int getUserCount();
}