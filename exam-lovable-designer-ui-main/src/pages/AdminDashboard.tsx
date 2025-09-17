import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  Activity,
  UserCheck,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  BarChart3,
  Settings,
  FileText,
  Brain,
  Clock,
  Target,
  Award,
  Zap,
  Download,
  Eye,
  Calendar,
  Book
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface DashboardData {
  overview: {
    total_professors: number;
    total_admins: number;
    total_users: number;
    recent_professors_this_week: number;
    total_credits_issued: number;
    average_credits_per_professor: number;
  };
  credit_analytics: {
    total_credits_in_system: number;
    professors_with_low_credits: number;
    professors_with_high_usage: number;
  };
  system_health: {
    active_professors: number;
    inactive_professors: number;
    database_status: string;
  };
}

interface AdvancedAnalytics {
  question_analytics: {
    total_questions: number;
    questions_this_week: number;
    questions_this_month: number;
    difficulty_distribution: { [key: string]: number };
    subject_distribution: Array<{ _id: string; count: number }>;
    ai_generated_questions: number;
  };
  paper_analytics: {
    total_papers: number;
    papers_this_week: number;
    papers_this_month: number;
    exam_type_distribution: Array<{ _id: string; count: number }>;
    avg_questions_per_paper: number;
  };
  activity_analytics: {
    generation_activities_week: number;
    ai_usage_week: number;
    credit_transactions_week: number;
    total_credits_consumed: number;
    avg_generation_time_seconds: number;
  };
  top_active_users: Array<{
    _id: number;
    activity_count: number;
    email?: string;
    name?: string;
  }>;
  system_health: {
    database_status: string;
    total_users: number;
    active_professors_week: number;
  };
}

interface Professor {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  institution: string;
  credits: number;
  date_joined: string;
  last_login: string;
  is_active: boolean;
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalytics | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState<number | null>(null);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Admin Dashboard - Auth State:', { isAuthenticated, user });
    
    // Only redirect if auth check is complete and user is not authenticated
    if (!loading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to signin');
      navigate('/signin');
      return;
    }

    // Only fetch data if authenticated and user is loaded
    if (isAuthenticated && user) {
      if (user?.user_type !== 'admin') {
        console.log('User is not admin, type:', user?.user_type);
        // For now, let's not block and see what happens
      }
      
      console.log('Fetching admin dashboard data...');
      fetchDashboardData();
      fetchProfessors();
      fetchAdvancedAnalytics();
    }
  }, [isAuthenticated, user, loading]); // Add loading to dependencies

  const fetchAdvancedAnalytics = async () => {
    try {
      console.log('🔄 Fetching advanced analytics...');
      const response = await axiosInstance.get('/auth/admin/analytics/');
      console.log('✅ Advanced analytics fetched successfully:', response.data);
      setAnalyticsData(response.data);
    } catch (error: any) {
      console.error('❌ Failed to fetch advanced analytics:', error);
      // Non-fatal: analytics are optional
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data with cookies...');
      const response = await axiosInstance.get('/auth/admin/dashboard/');
      console.log('✅ Dashboard data fetched successfully:', response.data);
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await axiosInstance.get('/auth/admin/professors/');
      setProfessors(response.data.professors);
    } catch (error: any) {
      console.error('Failed to fetch professors:', error);
      setError(error.response?.data?.error || 'Failed to fetch professors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditAction = async (professorId: number, action: 'add' | 'deduct') => {
    if (!creditAmount || parseInt(creditAmount) <= 0) {
      alert('Please enter a valid credit amount');
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/admin/credits/', {
        professor_id: professorId,
        action: action,
        amount: parseInt(creditAmount)
      });

      alert(response.data.message);
      setCreditAmount('');
      setSelectedProfessor(null);
      fetchProfessors(); // Refresh the list
    } catch (error: any) {
      console.error('Credit operation failed:', error);
      alert(error.response?.data?.error || 'Credit operation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navigation />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navigation />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage professors, monitor system activity, and analyze usage</p>
          </div>

          {/* Overview Cards */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Professors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.overview.total_professors}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardData.overview.recent_professors_this_week} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.overview.total_credits_issued}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {dashboardData.overview.average_credits_per_professor} per professor
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Professors</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.system_health.active_professors}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.system_health.inactive_professors} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Credits Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData.credit_analytics.professors_with_low_credits}
                  </div>
                  <p className="text-xs text-muted-foreground">Professors with &lt;5 credits</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="professors">Professors</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {analyticsData && (
                <div className="space-y-6">
                  {/* Question Paper Generation Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.question_analytics.total_questions}</div>
                        <p className="text-xs text-muted-foreground">
                          +{analyticsData.question_analytics.questions_this_week} this week
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Question Papers</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.paper_analytics.total_papers}</div>
                        <p className="text-xs text-muted-foreground">
                          +{analyticsData.paper_analytics.papers_this_week} this week
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.question_analytics.ai_generated_questions}</div>
                        <p className="text-xs text-muted-foreground">
                          AI-powered questions
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generation Activity</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.activity_analytics.generation_activities_week}</div>
                        <p className="text-xs text-muted-foreground">
                          Activities this week
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Avg Generation Time:</span>
                          <span className="font-medium">
                            {analyticsData.activity_analytics.avg_generation_time_seconds.toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Questions/Paper:</span>
                          <span className="font-medium">
                            {analyticsData.paper_analytics.avg_questions_per_paper.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credits Consumed:</span>
                          <span className="font-medium">
                            {analyticsData.activity_analytics.total_credits_consumed}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Difficulty Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(analyticsData.question_analytics.difficulty_distribution).map(([level, count]) => (
                            <div key={level} className="flex justify-between">
                              <span className="capitalize">{level}:</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Book className="h-5 w-5" />
                          Subject Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {analyticsData.question_analytics.subject_distribution.slice(0, 5).map((subject) => (
                            <div key={subject._id} className="flex justify-between">
                              <span className="truncate">{subject._id}:</span>
                              <Badge variant="outline">{subject.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Active Users */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Most Active Professors This Week
                      </CardTitle>
                      <CardDescription>Top users by question paper generation activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.top_active_users.slice(0, 5).map((user, index) => (
                          <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{user.name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{user.activity_count} activities</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Professors Tab */}
            <TabsContent value="professors">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Professor List</CardTitle>
                      <CardDescription>Manage and monitor professor accounts</CardDescription>
                    </div>
                    <Button onClick={fetchProfessors} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {professors.map((professor) => (
                      <div key={professor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{professor.first_name} {professor.last_name}</h4>
                          <p className="text-sm text-gray-600">{professor.email}</p>
                          <p className="text-sm text-gray-500">{professor.institution}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={professor.is_active ? "default" : "secondary"}>
                              {professor.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Credits: <span className="font-medium">{professor.credits}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Joined: {professor.date_joined}</p>
                          <p className="text-sm text-gray-500">Last login: {professor.last_login}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Management</CardTitle>
                  <CardDescription>Add or deduct credits from professor accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="professor-select">Select Professor</Label>
                        <select
                          id="professor-select"
                          className="w-full p-2 border rounded-md"
                          value={selectedProfessor || ''}
                          onChange={(e) => setSelectedProfessor(parseInt(e.target.value))}
                        >
                          <option value="">Choose a professor...</option>
                          {professors.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                              {prof.first_name} {prof.last_name} - {prof.credits} credits
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credit-amount">Credit Amount</Label>
                        <Input
                          id="credit-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                    
                    {selectedProfessor && (
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleCreditAction(selectedProfessor, 'add')}
                          className="flex items-center gap-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add Credits
                        </Button>
                        <Button
                          onClick={() => handleCreditAction(selectedProfessor, 'deduct')}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <MinusCircle className="h-4 w-4" />
                          Deduct Credits
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              {analyticsData && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Real-time Activity Monitor</CardTitle>
                      <CardDescription>Monitor question paper generation activities and system usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 border rounded-lg">
                          <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold">{analyticsData.activity_analytics.generation_activities_week}</div>
                          <div className="text-sm text-gray-500">Total Activities</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <div className="text-2xl font-bold">{analyticsData.activity_analytics.ai_usage_week}</div>
                          <div className="text-sm text-gray-500">AI Generations</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold">{analyticsData.activity_analytics.credit_transactions_week}</div>
                          <div className="text-sm text-gray-500">Credit Transactions</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                          <div className="text-2xl font-bold">{analyticsData.system_health.active_professors_week}</div>
                          <div className="text-sm text-gray-500">Active Professors</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Exam Type Distribution</CardTitle>
                        <CardDescription>Papers created by exam type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analyticsData.paper_analytics.exam_type_distribution.map((examType) => (
                            <div key={examType._id} className="flex items-center justify-between p-3 border rounded">
                              <span className="capitalize font-medium">{examType._id}</span>
                              <Badge variant="secondary">{examType.count} papers</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Current system status and metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Database Status:</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {analyticsData.system_health.database_status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Total System Users:</span>
                            <span className="font-medium">{analyticsData.system_health.total_users}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Questions This Month:</span>
                            <span className="font-medium">{analyticsData.question_analytics.questions_this_month}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Papers This Month:</span>
                            <span className="font-medium">{analyticsData.paper_analytics.papers_this_month}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Users:</span>
                          <span className="font-medium">{dashboardData.overview.total_users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Professors:</span>
                          <span className="font-medium">{dashboardData.overview.total_professors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Admins:</span>
                          <span className="font-medium">{dashboardData.overview.total_admins}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Database Status:</span>
                          <Badge variant="default">{dashboardData.system_health.database_status}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Credit Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Credits in System:</span>
                          <span className="font-medium">{dashboardData.credit_analytics.total_credits_in_system}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Credit Alerts:</span>
                          <span className="font-medium text-orange-600">
                            {dashboardData.credit_analytics.professors_with_low_credits}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>High Usage Accounts:</span>
                          <span className="font-medium text-red-600">
                            {dashboardData.credit_analytics.professors_with_high_usage}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Question Paper Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Questions Created:</span>
                          <span className="font-medium">{analyticsData.question_analytics.total_questions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Papers Generated:</span>
                          <span className="font-medium">{analyticsData.paper_analytics.total_papers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI-Generated Questions:</span>
                          <span className="font-medium">{analyticsData.question_analytics.ai_generated_questions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Questions per Paper:</span>
                          <span className="font-medium">{analyticsData.paper_analytics.avg_questions_per_paper.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Credits Consumed:</span>
                          <span className="font-medium text-red-600">{analyticsData.activity_analytics.total_credits_consumed}</span>
                        </div>
                      </div>
                    )}
                    {!analyticsData && (
                      <div className="text-sm text-gray-500">Loading analytics...</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Usage Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Questions This Week:</span>
                          <span className="font-medium text-green-600">+{analyticsData.question_analytics.questions_this_week}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Papers This Week:</span>
                          <span className="font-medium text-green-600">+{analyticsData.paper_analytics.papers_this_week}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Usage This Week:</span>
                          <span className="font-medium text-purple-600">{analyticsData.activity_analytics.ai_usage_week}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credit Transactions:</span>
                          <span className="font-medium">{analyticsData.activity_analytics.credit_transactions_week}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Generation Time:</span>
                          <span className="font-medium">{analyticsData.activity_analytics.avg_generation_time_seconds.toFixed(1)}s</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;