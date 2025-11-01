import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  GraduationCap,
  Target,
  Eye,
  Heart,
  Users,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Clock,
  TrendingUp
} from 'lucide-react';

const About = () => {
  const teamValues = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize educational assessment by providing intelligent, efficient, and accessible question paper generation tools for educators worldwide.',
      color: 'text-blue-600'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'A world where every educator can create high-quality assessments effortlessly, fostering better learning outcomes and educational excellence.',
      color: 'text-purple-600'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'Innovation, reliability, and user-centric design drive everything we do. We believe in empowering educators with cutting-edge technology.',
      color: 'text-pink-600'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Concept Born',
      description: 'Identified the need for intelligent assessment tools in modern education',
      achievement: 'Research Phase'
    },
    {
      year: '2024',
      title: 'Development Started',
      description: 'Assembled expert team and began platform development',
      achievement: 'Alpha Launch'
    },
    {
      year: '2025',
      title: 'Platform Launch',
      description: 'IntelliExam Designer officially launched with advanced AI features',
      achievement: 'Product Launch'
    },
    {
      year: 'Future',
      title: 'Global Expansion',
      description: 'Expanding to serve educational institutions worldwide',
      achievement: 'Growth Phase'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate professional question papers in minutes, not hours',
      stat: '80% faster'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee',
      stat: '99.9% uptime'
    },
    {
      icon: Users,
      title: 'User Focused',
      description: 'Designed by educators for educators with intuitive workflows',
      stat: '1000+ users'
    },
    {
      icon: TrendingUp,
      title: 'Constantly Evolving',
      description: 'Regular updates with new features based on user feedback',
      stat: 'Monthly updates'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4 mr-2" />
            About IntelliExam Designer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Empowering Educators Through
            <span className="block text-primary">Intelligent Technology</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            IntelliExam Designer was born from a simple observation: educators spend countless hours 
            creating assessments when they could be focusing on what matters most - teaching. 
            We're here to change that.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamValues.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4">
                    <value.icon className={`h-8 w-8 ${value.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/50 text-primary text-sm font-medium mb-6">
                <Award className="h-4 w-4 mr-2" />
                Our Journey
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                From Classroom Challenges
                <span className="block text-primary">To Digital Solutions</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Founded by a team of educators and technologists, IntelliExam Designer addresses 
                the real-world challenges faced in educational assessment creation. We understand 
                the pain points because we've lived them.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Our platform combines deep educational expertise with cutting-edge technology 
                to deliver a solution that's not just powerful, but practical and intuitive 
                for educators at all technical levels.
              </p>
              
              <Link to="/more-info">
                <Button 
                  size="lg"
                  className="gradient-primary text-white hover:opacity-90 transition-all duration-200"
                >
                  Explore Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-video bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 gradient-primary rounded-2xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Educators
              <span className="block text-primary">Choose Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with precision, designed for impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {feature.description}
                  </CardDescription>
                  <Badge variant="secondary" className="text-primary font-semibold">
                    {feature.stat}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey Through
              <span className="block text-primary">The Years</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary to-purple-400"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex-1">
                  <Card className={`border-0 shadow-lg mx-4 ${index % 2 === 0 ? 'ml-auto mr-8' : 'ml-8 mr-auto'} max-w-md`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-primary border-primary">
                          {milestone.year}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {milestone.achievement}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {milestone.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {milestone.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 gradient-primary rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Commitment */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Users className="h-4 w-4 mr-2" />
            Our Commitment
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dedicated to Educational Excellence
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            We're not just building software; we're partnering with educators to transform 
            how assessments are created and delivered. Your success is our success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join Our Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 transition-all duration-200"
              >
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;