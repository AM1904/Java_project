package com.expenseTracker.service;

import com.expenseTracker.model.User;
import com.expenseTracker.exception.ValidationException;
import com.expenseTracker.exception.UserAlreadyExistsException;
import com.expenseTracker.exception.AuthenticationFailedException;

import java.util.ArrayList;


public class UserManager implements UserOperations {

    private ArrayList<User> userList;
    private int nextUserId;

    public UserManager() {
        userList = new ArrayList<User>();
        nextUserId = 1;
    }

    @Override
    public void validateUsername(String username) throws ValidationException {
        if (username == null) {
            throw new ValidationException("Username cannot be null.");
        }
        if (username.trim().isEmpty()) {
            throw new ValidationException("Username cannot be empty.");
        }
    }

    @Override
    public void validatePassword(String password) throws ValidationException {
        if (password == null) {
            throw new ValidationException("Password cannot be null.");
        }
        if (password.trim().isEmpty()) {
            throw new ValidationException("Password cannot be empty.");
        }
        if (password.trim().length() < 6) {
            throw new ValidationException("Password must contain at least 6 characters.");
        }
    }

    @Override
    public boolean isUsernameTaken(String username) {
        if (username == null) return false;
        String trimmed = username.trim();
        for (User user : userList) {
            if (user.getUsername().equalsIgnoreCase(trimmed)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public User registerUser(String username, String password) 
            throws ValidationException, UserAlreadyExistsException {

        validateUsername(username);
        validatePassword(password);

        String trimmedUsername = username.trim();

        if (isUsernameTaken(trimmedUsername)) {
            throw new UserAlreadyExistsException("Username '" + trimmedUsername + "' already exists.");
        }

        User newUser = new User(nextUserId, trimmedUsername, password.trim());
        userList.add(newUser);
        nextUserId++;

        return newUser;
    }

    @Override
    public User authenticateUser(String username, String password) 
            throws ValidationException, AuthenticationFailedException {

        validateUsername(username);
        validatePassword(password);

        String trimmedUsername = username.trim();
        String trimmedPassword = password.trim();

        for (User user : userList) {
            if (user.getUsername().equalsIgnoreCase(trimmedUsername)) {
                if (user.getPassword().equals(trimmedPassword)) {
                    return user;
                }
                break;
            }
        }

        throw new AuthenticationFailedException("Invalid username or password.");
    }

    @Override
    public void displayAllUsers() {
        if (userList.isEmpty()) {
            System.out.println("No users registered yet.");
            return;
        }

        System.out.println("\n===== REGISTERED USERS =====\n");
        for (User user : userList) {
            user.displayUserInfo();
            System.out.println();
        }
    }

    @Override
    public int getUserCount() {
        return userList.size();
    }
}