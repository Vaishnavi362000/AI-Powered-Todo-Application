# to_do_list.py

def load_tasks(filename="tasks.txt"):
    """Load tasks from a file."""
    try:
        with open(filename, "r") as file:
            tasks = file.read().splitlines()
    except FileNotFoundError:
        tasks = []
    return tasks

def save_tasks(tasks, filename="tasks.txt"):
    """Save tasks to a file."""
    with open(filename, "w") as file:
        for task in tasks:
            file.write(task + "\n")

def add_task(tasks, task):
    """Add a task to the list."""
    tasks.append(task)
    print(f"Added task: {task}")

def remove_task(tasks, task):
    """Remove a task from the list."""
    try:
        tasks.remove(task)
        print(f"Removed task: {task}")
    except ValueError:
        print(f"Task not found: {task}")

def display_tasks(tasks):
    """Display all tasks."""
    if not tasks:
        print("No tasks to display.")
    else:
        print("Tasks:")
        for i, task in enumerate(tasks, 1):
            print(f"{i}. {task}")

def main():
    tasks = load_tasks()
    while True:
        print("\nOptions: add, remove, display, quit")
        choice = input("Enter your choice: ").strip().lower()

        if choice == "add":
            task = input("Enter a task: ").strip()
            add_task(tasks, task)
        elif choice == "remove":
            task = input("Enter a task to remove: ").strip()
            remove_task(tasks, task)
        elif choice == "display":
            display_tasks(tasks)
        elif choice == "quit":
            save_tasks(tasks)
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()