import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

export function NewQuestionForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const popularTags = [
    'react', 'javascript', 'typescript', 'css', 'html', 'node.js',
    'python', 'java', 'api', 'database', 'authentication', 'deployment'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New question:', formData);

    setIsSubmitting(false);
    onClose();
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Question Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="What's your programming question? Be specific."
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full"
          required
        />
        <p className="text-xs text-muted-foreground">
          Make your title descriptive and specific to get better answers.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="body">Question Details</Label>
        <Textarea
          id="body"
          placeholder="Provide more details about your question. Include what you've tried, what you expected, and what actually happened."
          value={formData.body}
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
          className="min-h-32 resize-none"
          required
        />
        <p className="text-xs text-muted-foreground">
          Include relevant code, error messages, and steps you've already taken.
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (up to 5)</Label>

        {/* Current Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tag Input */}
        <Input
          id="tags"
          type="text"
          placeholder="Add tags (press Enter or comma to add)"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyDown={handleTagKeyPress}
          disabled={formData.tags.length >= 5}
        />

        {/* Popular Tags */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Popular tags:</p>
          <div className="flex flex-wrap gap-1">
            {popularTags
              .filter(tag => !formData.tags.includes(tag))
              .slice(0, 8)
              .map(tag => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.length >= 5}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
          </div>
        </div>
      </div>

      {/* Character Count */}
      <div className="text-xs text-muted-foreground">
        Title: {formData.title.length} characters | Body: {formData.body.length} characters
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!formData.title.trim() || !formData.body.trim() || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Posting...' : 'Post Question'}
        </Button>
      </div>
    </form>
  );
}
