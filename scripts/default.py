import os

def list_python_scripts(folder_path):
    python_scripts = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.py') and filename != 'default.py':
            script_name = os.path.splitext(filename)[0]
            with open(os.path.join(folder_path, filename), 'r') as file:
                first_line = file.readline().strip()
                if first_line.startswith('#'):
                    description = first_line[1:].strip()
                    python_scripts.append((script_name, description))
                else:
                    python_scripts.append((script_name, None))
    return python_scripts

# Provide the folder path where the scripts are located
folder_path = '/scripts'

# List all the available Python script names with their descriptions
scripts = list_python_scripts(folder_path)

# Print the script names and descriptions
for script, description in scripts:
    if description:
        print(f"> make py from={script}\n{description}\n")
    else:
        print(f"> make py from={script}\n")
