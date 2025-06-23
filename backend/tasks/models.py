from django.db import models
from django.conf import settings

# Create your models here.
class TaskManager(models.Manager):
    def for_user(self, user):
        return self.filter(assigned_to=user)

    def with_status(self, status):
        return self.filter(status=status)
    
class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks',
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name = 'tasks_created',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TaskManager()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title