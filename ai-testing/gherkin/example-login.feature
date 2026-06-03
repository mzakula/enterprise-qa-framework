Feature: User Login
  As a registered user
  I want to log into my account
  So that I can access my dashboard

  Background:
    Given the user is on the login page

  Scenario: Successful login with valid credentials
    When the user enters a valid username and password
    And the user clicks the login button
    Then the user should be directed to their dashboard

  Scenario Outline: Failed login attempts
    When the user enters "<username>" and "<password>"
    And the user clicks the login button
    Then the user should see an error message

    Examples:

      | username | password |
      | user1    | wrong    |
      | admin    | badpass  |
