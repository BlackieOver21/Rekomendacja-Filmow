import os
import numpy as np # Często potrzebne do przygotowania danych
import torch.nn as nn
import torch
import json
import sklearn
import pickle

loaded_model_info = None

MODEL_FILENAME = 'movie_recommendation_model.pth' # PRZYKŁADOWA NAZWA - ZMIEŃ NA WŁAŚCIWĄ
MODEL_FILE_PATH = os.path.join(os.path.dirname(__file__), 'ml_models', MODEL_FILENAME)

class MovieNCF(nn.Module):
    def __init__(self, num_users, num_movies, feature_dim, hidden_dim=64):
        super().__init__()
        self.user_embedding = nn.Embedding(num_users, hidden_dim)
        self.movie_embedding = nn.Embedding(num_movies, hidden_dim)

        self.feature_layer = nn.Sequential(
            nn.Linear(feature_dim, hidden_dim),
            nn.ReLU()
        )

        self.combined_layer = nn.Sequential(
            nn.Linear(hidden_dim * 3, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, user_idx, movie_idx, features):
        user_emb = self.user_embedding(user_idx)
        movie_emb = self.movie_embedding(movie_idx)
        feat = self.feature_layer(features)

        x = torch.cat([user_emb, movie_emb, feat], dim=1)
        return self.combined_layer(x).squeeze()

def load_model():
    """
    Ładuje model uczenia maszynowego z pliku
    """
    global loaded_model_info
    if loaded_model_info is not None:
        return loaded_model_info

    if not os.path.exists(MODEL_FILE_PATH):
        raise FileNotFoundError(f"Plik modelu nie istnieje: {MODEL_FILE_PATH}")

    model = None

    try:
        with open("ml_models\\user_enc.json", 'r', encoding='utf-8') as f:
            user2enc = json.load(f) 
            num_users = max(user2enc.values()) + 1
        with open("ml_models\\movie_enc.json", 'r', encoding='utf-8') as f:
            movie2enc = json.load(f)
            num_movies = max(movie2enc.values()) + 1       
        
        feature_dim = 23
        model = MovieNCF(num_users, num_movies, feature_dim)
        model.load_state_dict(torch.load(MODEL_FILE_PATH))
        model.eval() 
        loaded_model_info=model
        
        return loaded_model_info
    
    except Exception as e:
        print(f"Błąd podczas ładowania modelu {MODEL_FILE_PATH}: {e}")
        loaded_model_info = None
        raise

def reco(user_id, movies):
    """
    Pobiera rekomendację z załadowanego modelu
    """
    model = load_model()
    
    try:

        if model is None:
            raise RuntimeError("Model rekomendacji nie jest załadowany lub wystąpił błąd ładowania.")
    

        with open("scaler.pkl", "rb") as f:
            scaler = pickle.load(f)
        movies
        scal_features = scaler.fit(features)

        prediction = model(user_id, movie_id, scal_features)

        return prediction

    except Exception as e:        
        raise RuntimeError(f"Błąd inferencji modelem: {e}")
    