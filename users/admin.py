from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Post, Message

class UserAdmin(BaseUserAdmin):
    list_display = tuple(list(BaseUserAdmin.list_display) + ['role', 'approved'])
    list_filter = tuple(list(getattr(BaseUserAdmin, 'list_filter', [])) + ['role', 'approved'])
    fieldsets = getattr(BaseUserAdmin, 'fieldsets', tuple()) + (
        ('Additional Info', {'fields': ('role', 'phone', 'graduation_year', 'skills', 'job_title', 'company', 'bio', 'approved', 'profile_picture')}),
    )
    add_fieldsets = getattr(BaseUserAdmin, 'add_fieldsets', tuple()) + (
        ('Additional Info', {'fields': ('role', 'phone', 'graduation_year', 'skills', 'job_title', 'company', 'bio', 'approved', 'profile_picture')}),
    )

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Post)
admin.site.register(Message)
