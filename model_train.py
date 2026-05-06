# model_train.py
# Script to train an Inventory Demand Forecasting model using scikit-learn

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def create_dataset(n_samples=1000):
    """
    Creates a synthetic dataset for inventory demand forecasting.
    Features:
    - DayOfWeek (0-6)
    - IsWeekend (0 or 1)
    - PrevDaySales (integer)
    - PromotionActive (0 or 1)
    - Month (1-12)
    Target:
    - SalesDemand (Predicted demand)
    """
    np.random.seed(42)
    
    # Generate random features
    day_of_week = np.random.randint(0, 7, n_samples)
    is_weekend = (day_of_week >= 5).astype(int)
    month = np.random.randint(1, 13, n_samples)
    promotion_active = np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2])
    
    # Base sales with some seasonality and trend
    base_sales = 50 + 20 * np.sin(2 * np.pi * month / 12) 
    # Add day effects (higher on weekends)
    day_effect = is_weekend * 15
    # Promotion effect
    promo_effect = promotion_active * 30
    # Add noise
    noise = np.random.normal(0, 10, n_samples)
    
    sales_demand = base_sales + day_effect + promo_effect + noise
    sales_demand = np.maximum(0, sales_demand).astype(int)
    
    # PrevDaySales is just a shifted version with some randomness
    prev_day_sales = np.roll(sales_demand, 1)
    prev_day_sales[0] = np.mean(sales_demand)
    
    data = pd.DataFrame({
        'day_of_week': day_of_week,
        'is_weekend': is_weekend,
        'prev_day_sales': prev_day_sales,
        'promotion_active': promotion_active,
        'month': month,
        'sales_demand': sales_demand
    })
    
    return data

def train_model():
    print("Generating training data...")
    data = create_dataset()
    
    X = data.drop('sales_demand', axis=1)
    y = data['sales_demand']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Model Training Complete.")
    print(f"Mean Absolute Error: {mae:.2f}")
    print(f"R2 Score: {r2:.2f}")
    
    # Save the model
    joblib.dump(model, 'model.pkl')
    print("Model saved to model.pkl")

if __name__ == "__main__":
    train_model()
