'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowRight, CheckCircle, Star, Sparkles, Target, FileText, Mail } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Google',
    content: 'This tool helped me land my dream job at Google! The AI feedback was incredibly detailed and actionable. I updated my resume based on the suggestions and got 3x more interview callbacks.',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Product Manager',
    company: 'Amazon',
    content: 'The refined resume copy was game-changing. It transformed my generic resume into a compelling narrative that showcased my achievements. Within 2 weeks, I had multiple offers from FAANG companies.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Emily Johnson',
    role: 'Data Scientist',
    company: 'Meta',
    content: 'As someone switching careers, I struggled to position my skills correctly. This AI resume analyzer gave me the clarity I needed. The tailored cover letter helped me stand out from hundreds of applicants.',
    rating: 5,
    avatar: 'EJ',
  },
  {
    name: 'David Park',
    role: 'UX Designer',
    company: 'Apple',
    content: 'I was skeptical at first, but the level of detail in the feedback blew me away. It caught things even professional resume writers missed. Best $5 I ever spent on my career.',
    rating: 5,
    avatar: 'DP',
  },
  {
    name: 'Priya Patel',
    role: 'Marketing Manager',
    company: 'Microsoft',
    content: 'The section-by-section breakdown was exactly what I needed. Instead of vague advice, I got specific, actionable improvements for every part of my resume. Highly recommend!',
    rating: 5,
    avatar: 'PP',
  },
  {
    name: 'James Wilson',
    role: 'DevOps Engineer',
    company: 'Netflix',
    content: 'This tool saved me hours of research and iteration. The AI understood my target role perfectly and suggested keywords that helped my resume pass ATS systems. Interview rate went from 10% to 60%.',
    rating: 5,
    avatar: 'JW',
  },
];

const features = [
  {
    icon: Target,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI evaluates your resume against industry standards and your specific career goals.',
  },
  {
    icon: FileText,
    title: 'Detailed Feedback',
    description: 'Section-by-section breakdown with specific, actionable recommendations for improvement.',
  },
  {
    icon: Sparkles,
    title: 'Refined Copy',
    description: 'Get a professionally rewritten version of your resume that highlights your achievements.',
  },
  {
    icon: CheckCircle,
    title: 'Custom Cover Letter',
    description: 'AI-generated cover letter tailored to your goals and target position requirements.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Store email in localStorage and redirect to analyze page
      localStorage.setItem('userEmail', email);
      router.push('/analyze');
    } catch {
      setMessage('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-slate-900 to-blue-900/20" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              Transform Your Resume with AI-Powered Insights
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Get expert-level feedback, refined copy, and a custom cover letter in minutes.
              Land more interviews at top companies.
            </p>

            {/* Email Capture Form */}
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to get started"
                    className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Please wait...' : 'Get Started Free'}
                  {!isSubmitting && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
              {message && (
                <p className="mt-3 text-sm text-red-400">{message}</p>
              )}
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <a
                href="#testimonials"
                className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
              >
                See Success Stories
              </a>
            </div>
            <p className="text-sm text-slate-400">
              Join 10,000+ professionals who landed their dream jobs
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Everything You Need to Stand Out
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg">
              Professional-grade resume optimization powered by advanced AI
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Success Stories from Real Users
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg">
              See how professionals like you landed jobs at top companies
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-slate-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-900/20 via-slate-800 to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Get AI-powered resume analysis and stand out from the competition
            </p>

            {/* Email Capture Form */}
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Starting...' : 'Start Analysis'}
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </button>
              </div>
            </form>

            <p className="text-sm text-slate-400">
              Free preview • Full analysis for just $5
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
