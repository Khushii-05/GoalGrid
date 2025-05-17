from app import create_app, db
from app.models import user, goal

app = create_app()

@app.cli.command("init-db")
def init_db():
    with app.app_context():
        db.create_all()

if __name__ == "__main__":
    app.run()