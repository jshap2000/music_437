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

Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

Create a superuser (you can access the django admin page with this user at localhost:8000/admin, which is helpful for observing databases)
```bash
python manage.py createsuperuser
```

Check if you can run the Django server
```bash
python manage.py runserver
```

Enter the server address into a Chrome-based web browser
