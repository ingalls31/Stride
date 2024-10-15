from django.db import models
import uuid
import os
from django.utils.deconstruct import deconstructible

@deconstructible
class RenameImage(object):
    def __init__(self, path):
        self.path = path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        if instance.id:
            filename = '{}.{}'.format(instance.id, ext)
        else:
            filename = '{}.{}'.format(uuid.uuid4(), ext)
        return os.path.join(self.path, filename)

class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to=RenameImage("static/"), blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def delete(self, *args, **kwargs):
        self.image.delete(save=False)
        super().delete(*args, **kwargs)
    class Meta:
        db_table = "image"