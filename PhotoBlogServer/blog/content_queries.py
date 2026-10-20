"""Shared ORM predicates for the web view and Android-facing JSON search."""
from django.db.models import Exists, OuterRef, Q
from .content_rules import normalize
from .models import PhotoTextLine


def filter_content(posts, *, theme="", tag="", terms=(), author=None):
    if theme == "unclassified":
        posts = posts.filter(Q(content__isnull=True) | Q(content__theme__isnull=True))
    elif theme:
        posts = posts.filter(content__theme=theme)
    if tag:
        posts = posts.filter(content__tags__normalized=normalize(tag))
    if author is not None:
        posts = posts.filter(author=author)
    for term in terms:
        matches = PhotoTextLine.objects.filter(content__post_id=OuterRef("pk")).filter(
            Q(norm_text__contains=term) | Q(compact_text__contains=term.replace(" ", "")))
        posts = posts.filter(Exists(matches))
    return posts
