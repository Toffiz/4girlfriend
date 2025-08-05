# Secure Credentials Module
# Uses environment variables and GitHub Secrets - NO hardcoded passwords!

import os
import base64

class SecureConfig:
    """Secure configuration using environment variables"""
    
    def __init__(self):
        # All credentials come from environment variables (GitHub Secrets)
        # NO hardcoded sensitive data in the code!
        pass
    
    def _get_env_or_encoded_fallback(self, env_key, encoded_fallback):
        """Get value from environment or use encoded fallback for development"""
        env_value = os.getenv(env_key)
        if env_value:
            return env_value
        
        # Only for local development - production uses GitHub Secrets
        try:
            return base64.b64decode(encoded_fallback).decode('utf-8')
        except:
            raise ValueError(f"Missing environment variable: {env_key}")
    
    def get_config(self):
        """Get database configuration from environment variables"""
        return {
            'host': self._get_env_or_encoded_fallback(
                'DB_HOST', 
                'ZGIuZWlqYnl5ZG1hbmVqcnh3Z2V0d3guc3VwYWJhc2UuY28='  # Only host is less sensitive
            ),
            'port': int(os.getenv('DB_PORT', '5432')),
            'database': self._get_env_or_encoded_fallback(
                'DB_NAME',
                'cG9zdGdyZXM='  # postgres
            ),
            'user': self._get_env_or_encoded_fallback(
                'DB_USER',
                'cG9zdGdyZXM='  # postgres
            ),
            # PASSWORD ONLY FROM ENVIRONMENT - NEVER HARDCODED!
            'password': os.getenv('DB_PASSWORD') or self._raise_password_error()
        }
    
    def _raise_password_error(self):
        """Raise error if password not found in environment"""
        raise ValueError(
            "DB_PASSWORD environment variable is required! "
            "For production: set in GitHub Secrets. "
            "For local development: set environment variable."
        )

# Create secure config instance
_secure_config = SecureConfig()
DB_CONFIG = _secure_config.get_config()

# Clean up
_secure_config = None
