Feature: User Login
  As a registered user
  I want to log into my account
  So that I can access my dashboard

  Background:
    Given the user is on the login page

  Scenario: Successful login with valid credentials
    When the user enters a valid username and password
    And the user clicks the login button
    Then the user should be redirected to the inventory page

  Scenario Outline: Failed login attempts
    When the user enters "<username>" and "<password>"
    And the user clicks the login button
    Then the user should see an error message containing "<error>"

    Examples:
      | username        | password      | error                                  |
      | invalid_user    | wrong_password | Epic sadface                          |
      | locked_out_user | secret_sauce   | Sorry, this user has been locked out  |
      |                 | secret_sauce   | Username is required                  |
      | standard_user   |                | Password is required                  |