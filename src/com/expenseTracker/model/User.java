package com.expenseTracker.model;

public class User {

    private int userId;
    private String username;
    private String password;

    public User() {
        this.userId = 0;
        this.username = "";
        this.password = "";
    }

    public User(int userId, String username, String password) {
        this.userId = userId;
        this.username = username;
        this.password = password;
    }

    public int getId() { return userId; }

    public int getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void displayUserInfo() {
        System.out.println("ID: " + userId);
        System.out.println("Username: " + username);
    }
}