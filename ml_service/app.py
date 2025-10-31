# ml_service/app.py
from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load the trained model and the preprocessor (scaler and PCA)
with open('model/xgboost_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('model/preprocessor.pkl', 'rb') as f:
    scaler, pca = pickle.load(f)

# Get the feature names the model was trained on (excluding 'Class')
# This is crucial for creating the DataFrame correctly
MODEL_FEATURES = ['Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 
                  'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20', 
                  'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        
        # Convert incoming data into a pandas DataFrame
        # IMPORTANT: The keys in 'data' must match your dataset's columns
        input_df = pd.DataFrame([data], columns=MODEL_FEATURES)
        
        # Fill any missing values with 0 (or a more appropriate value)
        input_df.fillna(0, inplace=True)

        # Pre-process the input data using the loaded scaler and PCA
        input_scaled = scaler.transform(input_df)
        input_pca = pca.transform(input_scaled)

        # Make a prediction
        prediction_code = model.predict(input_pca)
        prediction_result = 'Fraud' if prediction_code[0] == 1 else 'Valid'
        
        return jsonify({'prediction': prediction_result})

    except Exception as e:
        print("Error during prediction:", str(e))
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)