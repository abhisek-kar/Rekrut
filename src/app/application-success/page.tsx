"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, ArrowRight, Mail, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';
import Link from 'next/link';

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [applicationId] = useState(token ? token.slice(0, 8) : 'APP-' + Math.random().toString(36).substr(2, 6).toUpperCase());

  useEffect(() => {
    // In a real implementation, you might track this event for analytics
    console.log('Application submitted successfully', { token, applicationId });
  }, [token, applicationId]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your interest in joining our team. We've received your application and will review it carefully.
            </p>
          </div>

          {/* Application Reference */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Application Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="font-mono text-lg font-semibold text-center text-gray-900">
                  {applicationId}
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Please save this reference number for your records
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Submitted: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Under Review
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Application Review</h4>
                    <p className="text-gray-600 text-sm">
                      Our hiring team will carefully review your application and assess your qualifications.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Expected: 2-3 business days</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Initial Screening</h4>
                    <p className="text-gray-600 text-sm">
                      If your profile matches our requirements, we'll reach out for an initial conversation.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Expected: 1 week</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Interview Process</h4>
                    <p className="text-gray-600 text-sm">
                      We'll schedule interviews to get to know you better and discuss the role in detail.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Timeline varies by role</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Check Your Email</p>
                    <p className="text-gray-600">
                      We've sent a confirmation email with your application details. If you don't see it, please check your spam folder.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Stay Updated</p>
                    <p className="text-gray-600">
                      You can check the status of your application anytime using your reference number above.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Download className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Keep Your Documents Ready</p>
                    <p className="text-gray-600">
                      We may request additional documents during the interview process. Keep your portfolio and references handy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button variant="outline" className="w-full sm:w-auto">
                Browse More Jobs
              </Button>
            </Link>
            
            <Link href="/">
              <Button className="w-full sm:w-auto">
                Return to Homepage
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Questions About Your Application?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions or need to update your application, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <div className="text-gray-600">
                <span className="font-medium">Email:</span> careers@company.com
              </div>
              <div className="hidden sm:block text-gray-400">|</div>
              <div className="text-gray-600">
                <span className="font-medium">Phone:</span> (555) 123-4567
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
