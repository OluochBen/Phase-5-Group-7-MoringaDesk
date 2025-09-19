import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export function AnswerForm({ onSubmit, onCancel }) {
  const [answerBody, setAnswerBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answerBody.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(answerBody.trim());
    setAnswerBody('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="answer">Your Answer</Label>
        <Textarea
          id="answer"
          placeholder="Share your knowledge and help the community..."
          value={answerBody}
          onChange={(e) => setAnswerBody(e.target.value)}
          className="min-h-32 resize-none"
          required
        />
        <p className="text-xs text-muted-foreground">
          Provide a detailed answer with examples and explanations to help others learn.
        </p>
      </div>

      {/* Rich Text Editor Toolbar (Mock) */}
      <div className="border border-border rounded-md p-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
          >
            <Paperclip className="w-4 h-4 mr-1" />
            Attach
          </Button>
          <span className="text-xs">
            Supports markdown formatting
          </span>
        </div>
      </div>

      {/* Preview Section */}
      {answerBody && (
        <div className="border border-border rounded-md p-4 bg-muted/50">
          <Label className="text-sm font-medium mb-2 block">Preview:</Label>
          <div className="prose max-w-none text-sm">
            <p>{answerBody}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-xs text-muted-foreground">
          {answerBody.length} characters
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!answerBody.trim() || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              'Posting...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Answer
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
