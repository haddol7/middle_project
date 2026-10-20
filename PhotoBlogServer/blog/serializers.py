from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    photo_content = serializers.JSONField(write_only=True, required=False)

    def validate_photo_content(self, value):
        from .content_rules import validate_packet
        validate_packet(value)
        return value

    class Meta:
        model = Post
        fields = ("id", "author", "title", "text", "created_date", "published_date", "image", "photo_content")
        read_only_fields = ("id", "author", "created_date", "published_date")

