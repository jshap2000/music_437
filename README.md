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
OPTIONAL (If you intend on editing this code base, complete this step): Add the name of your local environment to ".gitignore"
```bash
echo '{Environment Name}' > .gitignore
```
Start your local environment: Windows
```bash
{Environment Name}\Scripts\Activate
```

Start your local environment: Mac
```bash
source {Environment Name}/bin/activate
```

Install Required Python Modules
```bash
pip install -r requirements.txt
```

Change directory to ./music/
```bash
cd music
```

Run Migrations
```bash
python manage.py migrate
```

Check if you can run the Django server (at same directory level as migrations)
```bash
python manage.py runserver
```

OPTIONAL: Create a superuser to access the REST framework
```bash
python manage.py createsuperuser
```

To start the frontend React app
```bash
cd ./music/frontend
npm install
npm start server
```


