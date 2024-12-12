from django.apps import AppConfig
from django.core.signals import setting_changed



class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'
    
    def ready(self) -> None:
        import inventory.signals
