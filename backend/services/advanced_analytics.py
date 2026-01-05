import pandas as pd
import numpy as np

def detect_anomalies(df: pd.DataFrame) -> dict:
    """
    Detects anomalies in numerical columns using Z-Score (Threshold > 3).
    Returns a dictionary suitable for frontend visualization (Scatter Plot).
    """
    anomalies = {}
    
    # 1. Identify Numerical Columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in numeric_cols:
        # Skip if too many NaNs or constant values
        if df[col].nunique() <= 1:
            continue
            
        data = df[col].dropna()
        if len(data) < 5: # Not enough data for stats
            continue
            
        mean = data.mean()
        std = data.std()
        
        if std == 0:
            continue
            
        # 2. Calculate Z-Scores
        z_scores = ((data - mean) / std).abs()
        outliers = z_scores[z_scores > 3]
        
        if not outliers.empty:
            # Prepare data for Recharts (Array of objects)
            # We want ALL points for the plot, but mark outliers
            plot_data = []
            # Sample if too large (Max 200 points for performance)
            sample_size = min(len(data), 200)
            sampled_indices = np.random.choice(data.index, sample_size, replace=False)
            sampled_indices = np.sort(sampled_indices) # Keep order
            
            for idx in sampled_indices:
                val = data.loc[idx]
                z = abs((val - mean) / std)
                plot_data.append({
                    "id": int(idx),
                    "value": float(val),
                    "isAnomaly": bool(z > 3),
                    "zScore": float(z)
                })
                
            anomalies[col] = {
                "count": len(outliers),
                "plot_data": plot_data,
                "mean": float(mean),
                "std": float(std)
            }
            
    return anomalies

def simulate_impacts(rule_results: dict, overall_score: float) -> dict:
    """
    Calculates the 'Point Impact' of each failed rule.
    "If I fix this rule, how much will my Health Score increase?"
    """
    impacts = {}
    
    # 1. Calculate Total Weight of ALL rules
    total_weight = sum([r.get("weight", 1.0) for r in rule_results.values()])
    
    if total_weight == 0:
        return {}
        
    current_health = overall_score
    
    for rule_key, res in rule_results.items():
        if not res["passed"]:
            # Logic: Impact = (Weight / Total_Possible_Score) * 100
            # Simplified: The percentage of the total score this rule represents.
            weight = res.get("weight", 1.0)
            
            # Impact on the 0-100 scale
            impact = (weight / total_weight) * 100
            
            # Cap impact so we don't exceed 100 (e.g. if current is 95, impact max is 5)
            # But the simulation is "What if", so raw points are better.
            
            impacts[rule_key] = round(impact, 2)
            
    return impacts
