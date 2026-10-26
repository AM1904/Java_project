package com.expenseTracker;

import com.expenseTracker.model.User;
import com.expenseTracker.service.UserOperations;
import com.expenseTracker.service.UserManager;
import com.expenseTracker.exception.ValidationException;
import com.expenseTracker.exception.UserAlreadyExistsException;
import com.expenseTracker.exception.AuthenticationFailedException;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);
        UserOperations userManager = new UserManager();

        boolean running = true;

        System.out.println("==============================");
        System.out.println("   SPLIT & EXPENSE TRACKER     ");
        System.out.println("==============================");

        while (running) {

            printMenu();

            System.out.print("Enter your choice: ");
            String choiceInput = scanner.nextLine().trim();

            switch (choiceInput) {

                case "1":
                    handleRegisterUser(scanner, userManager);
                    break;

                case "2":
                    handleLoginUser(scanner, userManager);
                    break;

                case "3":
                    userManager.displayAllUsers();
                    printDivider();
                    break;

                case "4":
                    System.out.println("\nThank you for using Split & Expense Tracker!");
                    running = false;
                    break;

                default:
                    System.out.println("\nError: Invalid choice. Please enter 1, 2, 3, or 4.");
                    printDivider();
                    break;
            }
        }

        scanner.close();
    }

    private static void printMenu() {
        System.out.println("\n===== SPLIT & EXPENSE TRACKER (Phase 2) =====\n");
        System.out.println("1. Register User");
        System.out.println("2. Login User");
        System.out.println("3. Display Users");
        System.out.println("4. Exit");
        System.out.println();
    }

    private static void printDivider() {
        System.out.println("--------------------------------");
    }

    private static void handleRegisterUser(Scanner scanner, UserOperations userManager) {
        System.out.println("\n--- Register New User ---");

        System.out.print("Enter username: ");
        String username = scanner.nextLine();

        System.out.print("Enter password: ");
        String password = scanner.nextLine();

        try {
            User newUser = userManager.registerUser(username, password);
            System.out.println("\nSuccess: User '" + newUser.getUsername() + "' (ID: " + newUser.getUserId() + ") registered successfully!");
        } catch (ValidationException e) {
            System.out.println("\n[Validation Error]: " + e.getMessage());
        } catch (UserAlreadyExistsException e) {
            System.out.println("\n[Duplicate User Error]: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("\n[Unexpected Error]: " + e.getMessage());
        } finally {
            printDivider();
        }
    }

    private static void handleLoginUser(Scanner scanner, UserOperations userManager) {
        System.out.println("\n--- User Login ---");

        System.out.print("Enter username: ");
        String username = scanner.nextLine();

        System.out.print("Enter password: ");
        String password = scanner.nextLine();

        try {
            User user = userManager.authenticateUser(username, password);
            System.out.println("\nSuccess: Welcome back, " + user.getUsername() + "! Login successful.");
        } catch (ValidationException e) {
            System.out.println("\n[Validation Error]: " + e.getMessage());
        } catch (AuthenticationFailedException e) {
            System.out.println("\n[Authentication Error]: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("\n[Unexpected Error]: " + e.getMessage());
        } finally {
            printDivider();
        }
    }
}