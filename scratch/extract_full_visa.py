import pandas as pd
import json

file_path = "c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/ListOfBillingLines_VisaFeeSchedule_BRAZIL_2026May03034026.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    data = []
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        # Filter for relevant columns and remove NaN
        df = df.dropna(subset=['Billing Line', 'Invoice Description'])
        data.extend(df.to_dict(orient='records'))
    
    with open("frontend/data/visa-billing-full.json", "w", encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Success: {len(data)} lines extracted.")
except Exception as e:
    print(f"Error: {e}")
