import pandas as pd
from models import db, Movies  # adjust import to your structure

def import_movies_if_empty():
    csv_path = 'movies_metadata.csv'  # assumes file is in the same directory

    # Check if movie table has any records
    if db.session.query(Movies).first():
        print("Movie table is not empty. Skipping import.")
        return

    print("Importing movies from movies_metadata.csv...")

    # Load and clean data
    df = pd.read_csv(csv_path, low_memory=False, usecols=['id', 'original_title'])
    df = df.dropna(subset=['id', 'original_title'])
    df = df[df['id'].apply(lambda x: str(x).isdigit())]
    df['id'] = df['id'].astype(int)

    df = df.drop_duplicates(subset=['id'])

    # Add each movie to the session
    for _, row in df.iterrows():
        movie = Movies(id=row['id'], title=row['original_title'])
        db.session.add(movie)

    db.session.commit()
    print(f"Imported {len(df)} movies.")