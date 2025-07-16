
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  Shield, 
  Database, 
  FileText, 
  Stamp, 
  ListChecks, 
  Calculator,
  Users,
  Brain,
  Download,
  Zap,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const MoreInfo = () => {
  const features = [
    {
      icon: Shield,
      title: 'Advanced Authentication',
      description: 'Multi-level user authentication with role-based access control for administrators, educators, and students.',
      details: ['SSO Integration', 'Multi-factor Authentication', 'Role-based Permissions', 'Audit Trails'],
      category: 'Security'
    },
    {
      icon: Database,
      title: 'Intelligent Syllabus Database',
      description: 'Comprehensive syllabus management with automatic content organization and cross-referencing capabilities.',
      details: ['Auto-categorization', 'Version Control', 'Search & Filter', 'Bulk Import/Export'],
      category: 'Management'
    },
    {
      icon: FileText,
      title: 'Previous Year Paper References',
      description: 'Access and reference previous examination papers to maintain consistency and track question evolution.',
      details: ['Historical Archives', 'Trend Analysis', 'Question Recycling Prevention', 'Performance Metrics'],
      category: 'Analytics'
    },
    {
      icon: Stamp,
      title: 'Custom Watermarking',
      description: 'Protect your intellectual property with customizable watermarks and security features.',
      details: ['Institution Branding', 'Anti-plagiarism Protection', 'Document Security', 'Version Tracking'],
      category: 'Security'
    },
    {
      icon: ListChecks,
      title: 'Multi-Type Questions',
      description: 'Support for various question formats including MCQ, short answer, essay, and practical assessments.',
      details: ['Multiple Choice', 'Short Answer', 'Essay Questions', 'Practical Assessments', 'Image-based Questions'],
      category: 'Content'
    },
    {
      icon: Calculator,
      title: 'Advanced Equation Support',
      description: 'LaTeX integration for complex mathematical equations and scientific notation.',
      details: ['LaTeX Integration', 'Mathematical Symbols', 'Scientific Notation', 'Formula Rendering'],
      category: 'Technical'
    }
  ];

  const benefits = [
    {
      title: 'Time Efficiency',
      description: 'Reduce question paper creation time by up to 80%',
      icon: Zap
    },
    {
      title: 'Quality Assurance',
      description: 'Maintain consistent quality across all assessments',
      icon: Star
    },
    {
      title: 'Scalability',
      description: 'Handle unlimited users and question banks',
      icon: Users
    },
    {
      title: 'AI-Powered',
      description: 'Leverage artificial intelligence for smart suggestions',
      icon: Brain
    }
  ];

  const categories = ['All', 'Security', 'Management', 'Analytics', 'Content', 'Technical'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFeatures = selectedCategory === 'All' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary text-sm font-medium mb-6">
            <Brain className="h-4 w-4 mr-2" />
            Advanced Features
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Features for
            <span className="block text-primary">Modern Education</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the full range of advanced capabilities that make IntelliExam Designer 
            the most comprehensive question paper generation platform for educational institutions.
          </p>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Explore our comprehensive suite of features designed to enhance every aspect 
              of your question paper creation workflow.
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "gradient-primary text-white" 
                    : "border-primary text-primary hover:bg-accent"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden"
              >
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/50 text-primary text-sm font-medium mb-6">
                <Calculator className="h-4 w-4 mr-2" />
                Technical Excellence
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built with Modern
                <span className="block text-primary">Technology Stack</span>
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                IntelliExam Designer leverages cutting-edge technologies to deliver 
                a robust, scalable, and secure platform that meets the demanding 
                requirements of educational institutions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Performance</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Cloud Infrastructure</span>
                      <span className="text-green-600 font-medium">99.9% Uptime</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Load Time</span>
                      <span className="text-green-600 font-medium">&lt; 2 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Concurrent Users</span>
                      <span className="text-green-600 font-medium">10,000+</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Security</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Data Encryption</span>
                      <span className="text-green-600 font-medium">AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance</span>
                      <span className="text-green-600 font-medium">SOC 2 Type II</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backup Frequency</span>
                      <span className="text-green-600 font-medium">Real-time</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/contact">
                <Button 
                  size="lg"
                  className="gradient-primary text-white hover:opacity-90 transition-all duration-200"
                >
                  Request Technical Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80"
                  alt="Technology and coding"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating tech elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 gradient-primary rounded-2xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & Export Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Integration &
              <span className="block text-primary">Professional Export</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with your existing systems and export professional-grade documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="p-3 gradient-primary rounded-xl w-fit mb-4">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Professional Export Options
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Multiple export formats to suit your institution's requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'High-quality PDF with custom formatting',
                    'Microsoft Word (.docx) compatibility',
                    'LaTeX source files for advanced editing',
                    'Web-ready HTML format',
                    'Bulk export for multiple papers'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="p-3 gradient-primary rounded-xl w-fit mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  System Integration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Connect with your existing educational technology stack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Learning Management System (LMS) integration',
                    'Student Information System (SIS) connectivity',
                    'Single Sign-On (SSO) compatibility',
                    'API access for custom integrations',
                    'Real-time data synchronization'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience All Features?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Start your free trial today and discover how IntelliExam Designer can 
            transform your assessment creation process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 transition-all duration-200"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MoreInfo;
