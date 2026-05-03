import pandas as pd
import json

file_path = "c:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio/ListOfBillingLines_VisaFeeSchedule_BRAZIL_2026May03034026.xlsx"

try:
    # Read all sheets
    xl = pd.ExcelFile(file_path)
    data = {}
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        # Convert to list of dicts, but only top 50 rows to keep it readable
        data[sheet_name] = df.head(50).to_dict(orient='records')
    
    with open("visa_billing_data.json", "w", encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Success: Data extracted to visa_billing_data.json")
except Exception as e:
    print(f"Error: {e}")
