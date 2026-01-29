"""
API CONFIGURATION FOR PYTHON BACKEND
=====================================

This file manages all API keys and configuration for the Python backend.

SETUP INSTRUCTIONS:
1. Copy this file to create a local config: cp config.py local_config.py
2. Edit local_config.py and add your API keys
3. The system will automatically use local_config.py if it exists

Or use environment variables (recommended for production):
- Set OPENAI_API_KEY in your environment
"""

import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class APIConfig:
    """Configuration for external APIs"""
    
    # OpenAI API Configuration
    # Get your key from: https://platform.openai.com/api-keys
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    
    # Alternative: Anthropic (Claude)
    # Get your key from: https://console.anthropic.com/
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-haiku-20240307"
    
    # Server Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "honeypot.log"


def load_config() -> APIConfig:
    """
    Load configuration from environment variables or local config file.
    
    Priority:
    1. Environment variables (highest)
    2. local_config.py file
    3. Default values (lowest)
    """
    config = APIConfig()
    
    # Try to load from local_config.py if it exists
    try:
        from local_config import LOCAL_CONFIG
        for key, value in LOCAL_CONFIG.items():
            if hasattr(config, key) and value:
                setattr(config, key, value)
    except ImportError:
        pass
    
    # Override with environment variables (highest priority)
    env_mappings = {
        'OPENAI_API_KEY': 'openai_api_key',
        'OPENAI_MODEL': 'openai_model',
        'OPENAI_BASE_URL': 'openai_base_url',
        'ANTHROPIC_API_KEY': 'anthropic_api_key',
        'ANTHROPIC_MODEL': 'anthropic_model',
        'API_HOST': 'api_host',
        'API_PORT': 'api_port',
        'LOG_LEVEL': 'log_level',
        'LOG_FILE': 'log_file',
    }
    
    for env_var, config_key in env_mappings.items():
        value = os.getenv(env_var)
        if value:
            # Convert port to int if needed
            if config_key == 'api_port':
                value = int(value)
            setattr(config, config_key, value)
    
    return config


def validate_config(config: APIConfig) -> tuple[bool, list[str]]:
    """
    Validate that required API keys are present.
    
    Returns:
        (is_valid, list_of_errors)
    """
    errors = []
    
    # Check if at least one AI provider is configured
    if not config.openai_api_key and not config.anthropic_api_key:
        errors.append(
            "No AI API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.\n"
            "Get OpenAI key from: https://platform.openai.com/api-keys\n"
            "Get Anthropic key from: https://console.anthropic.com/"
        )
    
    return len(errors) == 0, errors


# ============================================================
# TEMPLATE FOR local_config.py
# ============================================================
# Create a file named 'local_config.py' with this content:
"""
LOCAL_CONFIG = {
    # OpenAI API Key (Required for AI agent)
    # Get from: https://platform.openai.com/api-keys
    'openai_api_key': 'sk-your-key-here',
    
    # Optional: Use a different model
    'openai_model': 'gpt-4o-mini',
    
    # Optional: Anthropic as alternative
    # 'anthropic_api_key': 'sk-ant-your-key-here',
    
    # Server settings (optional)
    'api_host': '0.0.0.0',
    'api_port': 8000,
}
"""


# Quick test when run directly
if __name__ == "__main__":
    print("=" * 60)
    print("AI HONEYPOT - CONFIGURATION CHECK")
    print("=" * 60)
    
    config = load_config()
    is_valid, errors = validate_config(config)
    
    print(f"\nOpenAI API Key: {'✓ Set' if config.openai_api_key else '✗ Not set'}")
    print(f"Anthropic API Key: {'✓ Set' if config.anthropic_api_key else '✗ Not set'}")
    print(f"Model: {config.openai_model}")
    print(f"Server: {config.api_host}:{config.api_port}")
    
    if not is_valid:
        print("\n⚠️  CONFIGURATION ERRORS:")
        for error in errors:
            print(f"   - {error}")
        print("\nTo fix:")
        print("1. Create a file named 'local_config.py'")
        print("2. Add your API key (see template above)")
    else:
        print("\n✓ Configuration is valid!")
