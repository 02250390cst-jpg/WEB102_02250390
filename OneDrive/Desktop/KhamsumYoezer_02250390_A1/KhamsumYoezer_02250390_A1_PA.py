import urllib.request

# --------------------------------------------------------------
# 1. Perfect Number Sum Calculator
# --------------------------------------------------------------
def is_perfect_number(n):
    """Check if a number is a perfect number."""
    if n < 2:
        return False
    divisors = [i for i in range(1, n) if n % i == 0]
    return sum(divisors) == n


def perfect_number_sum(start, end):
    """
    Calculates the sum of all perfect numbers within a given range (inclusive).
    Args:
        start (int): Start of range
        end (int): End of range
    Returns:
        int: Sum of perfect numbers in the range
    """
    if start > end:
        start, end = end, start  # swap if in wrong order
    perfects = [n for n in range(start, end + 1) if is_perfect_number(n)]
    return sum(perfects)


# --------------------------------------------------------------
# 2. Weight Unit Converter
# --------------------------------------------------------------
def weight_converter(value, direction):
    """
    Converts weight between kilograms and pounds.
    Args:
        value (float): Numeric weight
        direction (str): 'K' for kilograms to pounds, 'P' for pounds to kilograms
    Returns:
        float: Converted value rounded to 2 decimals
    """
    if direction.upper() == 'K':
        return round(value * 2.205, 2)
    elif direction.upper() == 'P':
        return round(value / 2.205, 2)
    else:
        raise ValueError("Invalid conversion direction. Use 'K' or 'P'.")


# --------------------------------------------------------------
# 3. Vowel Counter
# --------------------------------------------------------------
def vowel_counter(text):
    """
    Counts vowels in a given string (case-insensitive).
    Args:
        text (str): Input text
    Returns:
        int: Number of vowels in the string
    """
    vowels = 'aeiouAEIOU'
    return sum(1 for char in text if char in vowels)


# --------------------------------------------------------------
# 4. Average and Range Finder
# --------------------------------------------------------------
def average_and_range(numbers):
    """
    Finds the average and range of a list of numbers.
    Args:
        numbers (list of float)
    Returns:
        tuple: (average, range)
    """
    if not numbers:
        return (0, 0)
    avg = sum(numbers) / len(numbers)
    rng = max(numbers) - min(numbers)
    return (avg, rng)


# --------------------------------------------------------------
# 5. String Reverser with Word Count
# --------------------------------------------------------------
def string_reverser(text):
    """
    Reverses a string and counts the number of words.
    Args:
        text (str)
    Returns:
        tuple: (reversed string, word count)
    """
    reversed_text = text[::-1]
    word_count = len([word for word in text.split() if word])
    return (reversed_text, word_count)


# --------------------------------------------------------------
# 6. Specific Word Counter (from URL)
# --------------------------------------------------------------
def specific_word_counter():
    """
    Counts specific words ('is', 'are', 'has', 'have') from the provided text file URL.
    Returns:
        dict: Counts of each specific word
    """
    url = "https://gist.githubusercontent.com/konrados/a1289ade329ac6f4598ebf5ee3dbcb3c/raw/"
    try:
        response = urllib.request.urlopen(url)
        text = response.read().decode('utf-8').lower()
        target_words = ["is", "are", "has", "have"]
        counts = {word: text.split().count(word) for word in target_words}
        return counts
    except Exception as e:
        return {"error": str(e)}


# --------------------------------------------------------------
# MAIN PROGRAM LOOP
# --------------------------------------------------------------
def main():
    """Main interactive menu for the program."""
    print("\nWelcome to Part A – Python Functions Program!")

    while True:
        print("\n========== MAIN MENU ==========")
        print("1. Calculate sum of perfect numbers")
        print("2. Convert weight units")
        print("3. Count vowels in a string")
        print("4. Find average and range of numbers")
        print("5. Reverse string and count words")
        print("6. Count specific words in text file")
        print("0. Exit program")

        choice = input("Enter your choice (0–6): ").strip()

        if choice == '1':
            # Perfect Number Sum
            try:
                start = int(input("Enter start of range: "))
                end = int(input("Enter end of range: "))
                result = perfect_number_sum(start, end)
                print(f"Sum of perfect numbers between {start} and {end}: {result}")
            except ValueError:
                print("❌ Please enter valid integers.")

        elif choice == '2':
            # Weight Converter
            try:
                value = float(input("Enter weight value: "))
                direction = input("Enter conversion direction ('K' for kg→lb, 'P' for lb→kg): ").strip().upper()
                if direction not in ['K', 'P']:
                    print("❌ Invalid direction! Please use 'K' or 'P'.")
                else:
                    converted = weight_converter(value, direction)
                    unit = "pounds" if direction == 'K' else "kilograms"
                    print(f"Converted value: {converted} {unit}")
            except ValueError:
                print("❌ Please enter a valid numeric value.")

        elif choice == '3':
            # Vowel Counter
            text = input("Enter a string: ")
            count = vowel_counter(text)
            print(f"Number of vowels: {count}")

        elif choice == '4':
            # Average & Range
            try:
                n = int(input("How many numbers do you want to enter? "))
                if n <= 0:
                    print("❌ Please enter a positive number.")
                    continue
                numbers = []
                for i in range(n):
                    while True:
                        try:
                            num = float(input(f"Enter number {i + 1}: "))
                            numbers.append(num)
                            break
                        except ValueError:
                            print("❌ Invalid input! Please enter a numeric value.")
                avg, rng = average_and_range(numbers)
                print(f"Average: {avg:.2f}, Range: {rng:.2f}")
            except ValueError:
                print("❌ Please enter an integer for count.")

        elif choice == '5':
            # String Reverser
            text = input("Enter a string: ")
            reversed_text, word_count = string_reverser(text)
            print(f"Reversed String: {reversed_text}")
            print(f"Word Count: {word_count}")

        elif choice == '6':
            # Specific Word Counter
            print("Fetching text from online source...")
            result = specific_word_counter()
            if "error" in result:
                print(f"⚠️ Error fetching text: {result['error']}")
            else:
                print("Word Counts:")
                for word, count in result.items():
                    print(f"  {word}: {count}")

        elif choice == '0':
            print("\n✅ Thank you for using the program. Goodbye!")
            break

        else:
            print("❌ Invalid choice! Please select a number between 0 and 6.")

        again = input("\nWould you like to perform another operation? (y/n): ").strip().lower()
        if again != 'y':
            print("\n✅ Exiting program. Have a nice day!")
            break


# Run the program
if __name__ == "__main__":
    main()