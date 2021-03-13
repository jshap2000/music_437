# music_437

## Setup Instructions

### Windows 10
First check your python version. You should at least have Python 3.8
```bash
python --version
```
Create a virtual environment for local setup. 
```bash
python -m venv {Environment Name}
```
Add the name of your local environment to ".gitignore"
```bash
echo '{Environment Name}' > .gitignore
```
Start your local environment
```bash
{Environment Name}\Scripts\Activate
```

Install Required Python Modules
```bash
pip install -r requirements.txt
```

Check if you can run the Django server
```bash
python manage.py runserver
```

Enter the server address into a Chrome-based web browser
