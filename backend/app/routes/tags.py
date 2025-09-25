from flask import Blueprint, request, jsonify
from sqlalchemy import func
from marshmallow import ValidationError

from .. import db
from ..models.tag import Tag
from ..schemas.tag_schema import TagSchema


tags_bp = Blueprint('tags', __name__)

tag_schema = TagSchema()


@tags_bp.get('')
def list_tags():
    """List tags with optional search and pagination.
    Query params:
      - q: search substring (case-insensitive)
      - page: page number (default 1)
      - per_page: items per page (default 20)
    """
    q = (request.args.get('q') or '').strip()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
    except Exception:
        page, per_page = 1, 20

    query = Tag.query
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(func.lower(Tag.name).like(like))

    pagination = query.order_by(Tag.name.asc()).paginate(page=page, per_page=per_page, error_out=False)
    items = [t.to_dict() for t in pagination.items]
    return jsonify({
        'items': items,
        'page': page,
        'per_page': per_page,
        'total': pagination.total,
    })


@tags_bp.post('')
def create_tag():
    """Create a tag if not exists. Returns existing if present.
    Body: { name }
    """
    data = request.get_json() or {}
    try:
        validated = tag_schema.load(data)
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400

    name = validated['name'].strip().lower()
    existing = Tag.query.filter(func.lower(Tag.name) == name).first()
    if existing:
        return jsonify({'tag': existing.to_dict()}), 200

    tag = Tag(name=name)
    db.session.add(tag)
    db.session.commit()
    return jsonify({'tag': tag.to_dict()}), 201
