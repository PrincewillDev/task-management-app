from rest_framework import serializers
from .models import Task
from accounts.models import User

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.EmailField(write_only=True, required=False)
    
    assigned_to_name = serializers.CharField(source='assigned_to.email', read_only=True)
    
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'description', 
            'status', 
            'assigned_to', 
            'assigned_to_email',
            'assigned_to_name',
            'created_by', 
            'created_by_name',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_assigned_to_email(self, value):
        """Prevent admins from assigning tasks to themselves"""
        if value:
            request = self.context.get('request')
            if request and request.user.email == value and request.user.is_staff:
                raise serializers.ValidationError(
                     "Admins cannot assign tasks to themselves. Please assign to regular users only."
                )
        return value
    
    def create(self, validated_data):
        assigned_to_email = validated_data.pop('assigned_to_email', None)
        
        if assigned_to_email:
            try:
                assigned_user = User.objects.get(email=assigned_to_email)
                validated_data['assigned_to'] = assigned_user
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {'assigned_to_email': 'User with this email does not exist.'}
                )
        
        validated_data['created_by'] = self.context['request'].user
        return Task.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        assigned_to_email = validated_data.pop('assigned_to_email', None)
        
        if assigned_to_email:
            try:
                assigned_user = User.objects.get(email=assigned_to_email)
                validated_data['assigned_to'] = assigned_user
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {'assigned_to_email': 'User with this email does not exist.'}
                )
        
        return super().update(instance, validated_data)

class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']  # Only allow updating the status for assignees
        read_only_fields = ['assigned_to', 'created_by']