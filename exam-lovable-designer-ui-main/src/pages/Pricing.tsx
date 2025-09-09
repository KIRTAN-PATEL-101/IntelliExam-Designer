import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import Navigation from "@/components/Navigation";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for individual educators and small classes",
      icon: Star,
      features: [
        "Up to 5 exams per month",
        "Up to 50 questions per exam",
        "Basic question types",
        "Student results tracking",
        "Email support",
        "Export to PDF"
      ],
      popular: false,
      buttonText: "Get Started",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for schools and training organizations",
      icon: Zap,
      features: [
        "Unlimited exams",
        "Unlimited questions",
        "All question types",
        "Advanced analytics",
        "Student management",
        "Custom branding",
        "API access",
        "Priority support",
        "Bulk import/export"
      ],
      popular: true,
      buttonText: "Start Free Trial",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large institutions with advanced needs",
      icon: Crown,
      features: [
        "Everything in Professional",
        "White-label solution",
        "SSO integration",
        "Advanced security",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom development",
        "SLA guarantee"
      ],
      popular: false,
      buttonText: "Contact Sales",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Select the perfect plan for your exam creation needs. All plans include our core features 
            with varying limits and advanced capabilities.
          </p>
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Check className="h-4 w-4 mr-2" />
            30-day money-back guarantee on all plans
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index}
                className={`relative bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 text-lg">{plan.period}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm px-4">
                    {plan.description}
                  </p>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <Button 
                    className={`w-full mb-8 py-3 text-base font-semibold bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                  
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and you'll be charged or credited proportionally.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 14-day free trial on our Professional plan. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer educational discounts?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer special pricing for educational institutions. Contact our sales team for details.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Better Exams?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators who trust ExamCraft for their assessment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;