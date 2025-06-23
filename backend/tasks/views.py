from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from rest_framework.exceptions import PermissionDenied
# Create your views here.

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Task.objects.all()
        else:
            return Task.objects.filter(assigned_to=user)
    
    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only admin users can create tasks")
        serializer.save(created_by=self.request.user)
        
class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Admin can access all tasks
            return Task.objects.all()
        else:
            # Regular users can only access their assigned tasks
            return Task.objects.filter(assigned_to=user)

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        user = request.user
        
        if not user.is_staff and task.assigned_to != user:
            raise PermissionDenied("You can only update tasks assigned to you")
        
        if not user.is_staff:
            allowed_fields = {'status'}
            if not set(request.data.keys()).issubset(allowed_fields):
                raise PermissionDenied("You can only update the status field")
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise permissions.PermissionDenied("Only admin users can delete tasks")
        return super().destroy(request, *args, **kwargs)
