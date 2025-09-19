import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

const mockFAQs = [
  {
    id: '1',
    question: 'How do I ask a good question on MoringaDesk?',
    answer: 'To ask a good question: 1) Search first to avoid duplicates, 2) Write a clear, specific title, 3) Provide context and what you\'ve tried, 4) Include relevant code samples, 5) Use appropriate tags, 6) Proofread before posting.',
    category: 'Getting Started',
    tags: ['questions', 'guidelines', 'best-practices'],
    views: 1250,
    helpful: 89,
    lastUpdated: new Date('2024-01-10'),
    createdBy: 'Admin'
  },
  {
    id: '2',
    question: 'What is the reputation system and how does it work?',
    answer: 'Reputation reflects your contributions to the community. You earn points by: asking good questions (+5), providing helpful answers (+10), having your answer accepted (+15), receiving upvotes (+10). You lose points for downvotes (-2).',
    category: 'Reputation',
    tags: ['reputation', 'points', 'scoring'],
    views: 987,
    helpful: 156,
    lastUpdated: new Date('2024-01-12'),
    createdBy: 'Admin'
  },
  {
    id: '3',
    question: 'How do I format code in my questions and answers?',
    answer: 'Use backticks for inline code: `code here`. For code blocks, use triple backticks with language specification: ```javascript\ncode here\n```. You can also use the code formatting button in the editor.',
    category: 'Formatting',
    tags: ['markdown', 'code', 'formatting'],
    views: 756,
    helpful: 234,
    lastUpdated: new Date('2024-01-08'),
    createdBy: 'Admin'
  },
  {
    id: '4',
    question: 'Can I edit my questions and answers after posting?',
    answer: 'Yes! You can edit your own posts at any time. Users with sufficient reputation can also suggest edits to improve posts. All edits are tracked and show revision history.',
    category: 'Editing',
    tags: ['editing', 'revisions', 'permissions'],
    views: 432,
    helpful: 67,
    lastUpdated: new Date('2024-01-14'),
    createdBy: 'Admin'
  },
  {
    id: '5',
    question: 'What should I do if my question is marked as duplicate?',
    answer: 'If your question is marked as duplicate, review the linked original question. If it doesn\'t answer your specific case, edit your question to clarify the differences. You can also leave a comment explaining why it\'s not a duplicate.',
    category: 'Moderation',
    tags: ['duplicates', 'moderation', 'guidelines'],
    views: 543,
    helpful: 89,
    lastUpdated: new Date('2024-01-11'),
    createdBy: 'Admin'
  }
];

const categories = [
  'All Categories',
  'Getting Started',
  'Reputation',
  'Formatting',
  'Editing',
  'Moderation',
  'Technical Issues'
];

export function FAQScreen({ currentUser }) {
  const [faqs, setFaqs] = useState(mockFAQs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: 'Getting Started',
    tags: ''
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateFAQ = () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const faq = {
      id: Date.now().toString(),
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category,
      tags: newFAQ.tags.split(',').map(tag => tag.trim()),
      views: 0,
      helpful: 0,
      lastUpdated: new Date(),
      createdBy: currentUser.name
    };

    setFaqs(prev => [faq, ...prev]);
    setNewFAQ({ question: '', answer: '', category: 'Getting Started', tags: '' });
    setShowCreateDialog(false);
  };

  const handleMarkHelpful = (id) => {
    setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, helpful: faq.helpful + 1 } : faq));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-2">Find answers to common questions about MoringaDesk</p>
        </div>
        {currentUser?.role === 'admin' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New FAQ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question..."
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter the answer..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newFAQ.tags}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., questions, guidelines, best-practices"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFAQ} className="bg-red-600 hover:bg-red-700">
                    Create FAQ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-md bg-white min-w-[180px]"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{faqs.length}</div>
          <div className="text-sm text-blue-800">Total FAQs</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {faqs.reduce((sum, faq) => sum + faq.views, 0).toLocaleString()}
          </div>
          <div className="text-sm text-green-800">Total Views</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {faqs.reduce((sum, faq) => sum + faq.helpful, 0)}
          </div>
          <div className="text-sm text-purple-800">Helpful Votes</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{categories.length - 1}</div>
          <div className="text-sm text-orange-800">Categories</div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                No FAQs found matching your search criteria.
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-2">{faq.question}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge variant="secondary">{faq.category}</Badge>
                      <span>{faq.views} views</span>
                      <span>{faq.helpful} helpful</span>
                      <span>Updated {faq.lastUpdated.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser?.role === 'admin' && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedFAQ === faq.id && (
                <CardContent className="pt-0">
                  <div className="prose max-w-none text-gray-700 mb-4">
                    {faq.answer}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {faq.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkHelpful(faq.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        👍 Helpful ({faq.helpful})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
