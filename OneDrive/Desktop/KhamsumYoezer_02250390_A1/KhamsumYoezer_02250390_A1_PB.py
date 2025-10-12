import random

# ------------------------------------------------------------
# SECTION 1: GUESS NUMBER GAME
# ------------------------------------------------------------
def guess_number_game():
    """
    A game where the computer picks a random number between 1 and 100,
    and the user tries to guess it. The program provides hints and counts
    the number of attempts made.
    """
    print("\n🎯 Welcome to the Guess Number Game!")
    print("I'm thinking of a number between 1 and 100...")

    number = random.randint(1, 100)
    attempts = 0

    while True:
        try:
            guess = int(input("Enter your guess (1–100): "))
            if guess < 1 or guess > 100:
                print("⚠️ Please enter a number between 1 and 100.")
                continue
        except ValueError:
            print("❌ Invalid input. Please enter a whole number.")
            continue

        attempts += 1

        if guess < number:
            print("Too low! Try again.")
        elif guess > number:
            print("Too high! Try again.")
        else:
            print(f"🎉 Correct! The number was {number}.")
            print(f"You guessed it in {attempts} attempts.")
            break

    print("Game over. Thanks for playing!\n")

# Uncomment the line below to play this section directly:
# guess_number_game()


# ------------------------------------------------------------
# SECTION 2: ROCK PAPER SCISSORS GAME
# ------------------------------------------------------------
def rock_paper_scissors():
    """
    A text-based Rock, Paper, Scissors game where the player competes
    against the computer. The game tracks wins, losses, and draws.
    """
    print("\n✊✋✌️ Welcome to Rock, Paper, Scissors!")
    print("Type 'rock', 'paper', or 'scissors' to play.")
    print("Type 'exit' to end the game.")

    choices = ["rock", "paper", "scissors"]
    wins = losses = draws = 0

    while True:
        user_choice = input("Your choice: ").strip().lower()

        if user_choice == "exit":
            break
        elif user_choice not in choices:
            print("⚠️ Invalid choice. Please enter rock, paper, or scissors.")
            continue

        computer_choice = random.choice(choices)
        print(f"Computer chose: {computer_choice}")

        if user_choice == computer_choice:
            print("It's a draw!")
            draws += 1
        elif (user_choice == "rock" and computer_choice == "scissors") or \
             (user_choice == "paper" and computer_choice == "rock") or \
             (user_choice == "scissors" and computer_choice == "paper"):
            print("✅ You win this round!")
            wins += 1
        else:
            print("❌ You lose this round.")
            losses += 1

        print(f"Score → Wins: {wins}, Losses: {losses}, Draws: {draws}\n")

    print("\nFinal Results:")
    print(f"Wins: {wins}, Losses: {losses}, Draws: {draws}")
    print("Thanks for playing Rock, Paper, Scissors!\n")

# Uncomment the line below to play this section directly:
# rock_paper_scissors()