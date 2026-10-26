package com.expenseTracker.model;

import java.sql.Date;
import java.sql.Timestamp;

public class Expense {
    private int id;
    private int userId;
    private String title;
    private double amount;
    private String category;
    private String splitWith;
    private String expenseDate;
    private Timestamp createdAt;

    public Expense() {}

    public Expense(int id, int userId, String title, double amount, String category, String splitWith, String expenseDate) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.splitWith = splitWith;
        this.expenseDate = expenseDate;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSplitWith() { return splitWith; }
    public void setSplitWith(String splitWith) { this.splitWith = splitWith; }

    public String getExpenseDate() { return expenseDate; }
    public void setExpenseDate(String expenseDate) { this.expenseDate = expenseDate; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}