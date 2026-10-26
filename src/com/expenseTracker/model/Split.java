package com.expenseTracker.model;

public class Split {
    private int id;
    private int expenseId;
    private int userId;
    private String personName;
    private double amount;
    private String type;   // TO_RECEIVE or TO_PAY
    private String status; // PENDING or PAID
    private String expenseTitle;

    public Split() {}

    public Split(int id, int expenseId, int userId, String personName, double amount, String type, String status) {
        this.id = id;
        this.expenseId = expenseId;
        this.userId = userId;
        this.personName = personName;
        this.amount = amount;
        this.type = type;
        this.status = status;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getExpenseId() { return expenseId; }
    public void setExpenseId(int expenseId) { this.expenseId = expenseId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getExpenseTitle() { return expenseTitle; }
    public void setExpenseTitle(String expenseTitle) { this.expenseTitle = expenseTitle; }
}