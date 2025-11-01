import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Undo, 
  Redo, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Plus,
  Trash2,
  Edit3,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  number: number;
  content: string;
  marks: number;
  type: string;
}

export const PdfEditorInterface = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      number: 1,
      content: 'Sample question content here. Click to edit.',
      marks: 5,
      type: 'short_answer'
    }
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(questions[0]);
  const [documentSettings, setDocumentSettings] = useState({
    title: 'Question Paper',
    subject: '',
    duration: '',
    totalMarks: 0,
    instructions: ''
  });

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      number: questions.length + 1,
      content: 'New question content',
      marks: 5,
      type: 'short_answer'
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion);
    toast({
      title: "Question Added",
      description: "New question has been added to the paper.",
    });
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    // Renumber questions
    const renumberedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      number: index + 1
    }));
    setQuestions(renumberedQuestions);
    setSelectedQuestion(renumberedQuestions[0] || null);
    toast({
      title: "Question Deleted",
      description: "Question has been removed from the paper.",
    });
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    if (selectedQuestion?.id === id) {
      setSelectedQuestion({ ...selectedQuestion, ...updates });
    }
  };

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Your edits have been saved successfully.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Ready",
      description: "PDF will be generated after API integration.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Edit3 className="h-8 w-8 text-primary" />
              PDF Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Edit and customize your question paper
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExport} className="gradient-primary text-white">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Document Settings */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Paper Title</Label>
                <Input
                  id="title"
                  value={documentSettings.title}
                  onChange={(e) =>
                    setDocumentSettings({ ...documentSettings, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={documentSettings.subject}
                  onChange={(e) =>
                    setDocumentSettings({ ...documentSettings, subject: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 3 hours"
                    value={documentSettings.duration}
                    onChange={(e) =>
                      setDocumentSettings({ ...documentSettings, duration: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    placeholder="100"
                    value={documentSettings.totalMarks}
                    onChange={(e) =>
                      setDocumentSettings({
                        ...documentSettings,
                        totalMarks: parseInt(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  rows={5}
                  placeholder="Enter exam instructions..."
                  value={documentSettings.instructions}
                  onChange={(e) =>
                    setDocumentSettings({
                      ...documentSettings,
                      instructions: e.target.value
                    })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Questions Summary</Label>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <Badge variant="secondary">{questions.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Marks:</span>
                  <Badge variant="default">
                    {questions.reduce((sum, q) => sum + q.marks, 0)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Middle Panel - Question Editor */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Question Editor
                </CardTitle>
                <Button onClick={handleAddQuestion} size="sm" className="gradient-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-6">
                  {/* Formatting Toolbar */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Underline className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="outline" size="sm">
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlignRight className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="outline" size="sm">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="outline" size="sm">
                          <Undo className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Redo className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question Editor */}
                  {selectedQuestion ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          Question {selectedQuestion.number}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question-content">Question Content</Label>
                          <Textarea
                            id="question-content"
                            rows={8}
                            value={selectedQuestion.content}
                            onChange={(e) =>
                              handleUpdateQuestion(selectedQuestion.id, {
                                content: e.target.value
                              })
                            }
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="marks">Marks</Label>
                            <Input
                              id="marks"
                              type="number"
                              value={selectedQuestion.marks}
                              onChange={(e) =>
                                handleUpdateQuestion(selectedQuestion.id, {
                                  marks: parseInt(e.target.value) || 0
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="type">Question Type</Label>
                            <Input
                              id="type"
                              value={selectedQuestion.type}
                              onChange={(e) =>
                                handleUpdateQuestion(selectedQuestion.id, {
                                  type: e.target.value
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No question selected. Add a new question to get started.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <Card className="bg-white">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {/* Document Header */}
                        <div className="text-center border-b pb-4">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {documentSettings.title}
                          </h2>
                          {documentSettings.subject && (
                            <p className="text-lg text-gray-700 mt-2">
                              {documentSettings.subject}
                            </p>
                          )}
                          <div className="flex justify-center gap-6 mt-2 text-sm text-muted-foreground">
                            {documentSettings.duration && (
                              <span>Duration: {documentSettings.duration}</span>
                            )}
                            {documentSettings.totalMarks > 0 && (
                              <span>Total Marks: {documentSettings.totalMarks}</span>
                            )}
                          </div>
                        </div>

                        {/* Instructions */}
                        {documentSettings.instructions && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900">Instructions:</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {documentSettings.instructions}
                            </p>
                          </div>
                        )}

                        {/* Questions */}
                        <div className="space-y-6">
                          {questions.map((question) => (
                            <div
                              key={question.id}
                              className="border-l-4 border-primary pl-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors rounded-r"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <div className="flex items-start justify-between">
                                <p className="font-semibold text-gray-900">
                                  Q{question.number}.
                                </p>
                                <Badge variant="outline">{question.marks} marks</Badge>
                              </div>
                              <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                                {question.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
