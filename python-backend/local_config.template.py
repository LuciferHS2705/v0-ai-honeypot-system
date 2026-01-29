"""
LOCAL CONFIGURATION FILE - TEMPLATE
====================================

INSTRUCTIONS:
1. Copy this file: cp local_config.template.py local_config.py
2. Edit local_config.py and add your API keys
3. The system will automatically use your keys

IMPORTANT: Never commit local_config.py to version control!
"""

LOCAL_CONFIG = {
    # =========================================================
    # OPENAI API KEY (Required)
    # =========================================================
    # Get your key from: https://platform.openai.com/api-keys
    # 
    # Steps:
    # 1. Go to https://platform.openai.com/
    # 2. Sign up or log in
    # 3. Go to API Keys section
    # 4. Click "Create new secret key"
    # 5. Copy the key (starts with sk-...)
    # 6. Paste it below
    #
    'openai_api_key': 'sk-PASTE-YOUR-KEY-HERE',
    
    # Model to use (optional, default is gpt-4o-mini)
    'openai_model': 'gpt-4o-mini',
    
    # =========================================================
    # ALTERNATIVE: ANTHROPIC API KEY (Optional)
    # =========================================================
    # If you prefer Claude over GPT, get key from:
    # https://console.anthropic.com/
    #
    # 'anthropic_api_key': 'sk-ant-PASTE-YOUR-KEY-HERE',
    # 'anthropic_model': 'claude-3-haiku-20240307',
    
    # =========================================================
    # SERVER SETTINGS (Optional)
    # =========================================================
    'api_host': '0.0.0.0',
    'api_port': 8000,
    'log_level': 'INFO',
    'log_file': 'honeypot.log',
}
