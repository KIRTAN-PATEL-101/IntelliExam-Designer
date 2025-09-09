
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'contact@intelliexam.com',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 5pm'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Education Street, Academic City, AC 12345',
      description: 'Come say hello at our office'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary text-sm font-medium mb-6">
            <MessageCircle className="h-4 w-4 mr-2" />
            Get In Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We'd Love to
            <span className="block text-primary">Hear From You</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about IntelliExam Designer? Need support or want to discuss 
            custom solutions for your institution? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Ready to revolutionize your question paper creation process? 
                    Reach out to us through any of these channels.
                  </p>
                </div>

                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 gradient-primary rounded-xl">
                          <info.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {info.title}
                          </h3>
                          <p className="text-primary font-medium mb-1">
                            {info.content}
                          </p>
                          <p className="text-sm text-gray-600">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-0 shadow-lg bg-gradient-secondary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-white rounded-xl">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Support Hours
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                          <p>Saturday: 9:00 AM - 2:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your requirements or questions..."
                          rows={6}
                          required
                          className="border-gray-300 focus:border-primary focus:ring-primary resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600">
                        Thank you for reaching out. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map/Illustration Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Us Here
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Located in the heart of the academic district, our office is easily accessible 
              for in-person consultations and demonstrations.
            </p>
          </div>
          
          <div className="aspect-video bg-gradient-to-br from-accent to-secondary rounded-2xl shadow-lg overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80"
              alt="Office location representation"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Visit Our Office</h3>
                <p className="text-lg opacity-90">Schedule a demo or consultation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
