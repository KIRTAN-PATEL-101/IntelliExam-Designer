import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  Plus, 
  FileText, 
  Brain, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  BarChart3,
  Users,
  Clock,
  Award
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Only redirect admin users after auth check is complete
    if (!loading && isAuthenticated && user?.user_type === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    
    // Only fetch data if authenticated
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, loading]); // Add loading to dependencies

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      const questionsResponse = await axios.get('http://localhost:8000/questions?limit=50');
      setQuestions(questionsResponse.data);
      
      const papersResponse = await axios.get('http://localhost:8000/papers?limit=50');
      setPapers(papersResponse.data);

      // Fetch overview stats (uses existing backend route)
      try {
        const statsResponse = await axios.get('http://localhost:8000/stats/overview');
        setStats(statsResponse.data);
      } catch (e) {
        // Non-fatal: stats are optional for dashboard
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Do not block the dashboard if unauthenticated; show a notice instead

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {!isAuthenticated && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Limited access</CardTitle>
              <CardDescription>
                You are viewing a public snapshot. Sign in to enable creating, editing, and exporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/signin')}>Sign In</Button>
            </CardContent>
          </Card>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name || 'Educator'}!
          </h1>
          <p className="text-gray-600">
            Manage your questions, create question papers, and leverage AI for intelligent assessment creation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.questions?.total_questions ?? questions.length}</div>
              <p className="text-xs text-muted-foreground">
                Questions in your database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Question Papers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.papers?.total_papers ?? papers.length}</div>
              <p className="text-xs text-muted-foreground">
                Papers created
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">∞</div>
              <p className="text-xs text-muted-foreground">
                AI-powered questions available
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="papers">Question Papers</TabsTrigger>
            <TabsTrigger value="ai-generation">AI Generation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Question Bank</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="grid gap-4">
              {questions.map((question) => (
                <Card key={question._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <CardDescription>{question.subject} • {question.topic}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="secondary">{question.question_type}</Badge>
                        <Badge variant="outline">{question.bloom_level}</Badge>
                        <Badge variant="default">{question.marks} marks</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{question.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Created: {new Date(question.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="papers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Question Papers</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Paper
              </Button>
            </div>

            <div className="grid gap-4">
              {papers.map((paper) => (
                <Card key={paper._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{paper.title}</CardTitle>
                        <CardDescription>{paper.subject}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="default">{paper.total_marks} marks</Badge>
                        <Badge variant="outline">{paper.duration_minutes} min</Badge>
                        <Badge variant="secondary">{paper.questions.length} questions</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Created: {new Date(paper.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai-generation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Question Generation</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Generate Questions with AI</CardTitle>
                <CardDescription>
                  Use artificial intelligence to create high-quality questions based on your specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="e.g., Mathematics" />
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" placeholder="e.g., Calculus" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="question_type">Question Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bloom_level">Bloom Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remember">Remember</SelectItem>
                        <SelectItem value="understand">Understand</SelectItem>
                        <SelectItem value="apply">Apply</SelectItem>
                        <SelectItem value="analyze">Analyze</SelectItem>
                        <SelectItem value="evaluate">Evaluate</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Questions with AI
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question Distribution</CardTitle>
                  <CardDescription>Questions by Bloom's Taxonomy level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(stats?.questions?.by_bloom_level || []).map((row: any) => (
                      <div className="flex justify-between" key={row._id}>
                        <span className="capitalize">{row._id}</span>
                        <Badge variant="outline">{row.count}</Badge>
                      </div>
                    ))}
                    {!stats?.questions?.by_bloom_level && (
                      <div className="text-sm text-gray-500">No analytics available</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subject Overview</CardTitle>
                  <CardDescription>Questions by subject area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(stats?.questions?.by_subject || []).map((row: any) => (
                      <div className="flex justify-between" key={row._id}>
                        <span>{row._id}</span>
                        <Badge variant="outline">{row.count}</Badge>
                      </div>
                    ))}
                    {!stats?.questions?.by_subject && (
                      <div className="text-sm text-gray-500">No analytics available</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
