// app/page.tsx
'use client';

import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ui/conversation';
import { Orb } from '@/components/ui/orb';
import { useState, useEffect, useRef } from 'react';
import { digits, loader, Matrix, vu, wave } from "@/components/ui/matrix"
import { DitherShader } from '@/components/ui/dither-shader';

export default function Home() {
  const [activeUseCase, setActiveUseCase] = useState('clinics');
  
  const messages = [
    { id: 1, content: 'Hello! How can I assist you today?' },
    { id: 2, content: 'I need to reschedule my physical with Dr. Miller for next Tuesday afternoon.' },
    { id: 3, content: 'Searching... Dr. Miller has a 2:30 PM and a 4:00 PM slot available on Tuesday. Which works better for you?' }
  ];

  const useCases = {
    restaurants: {
      title: 'Restaurants',
      icon: 'restaurant',
      badge: 'LVMH Certified',
      description: 'Reservations, takeout orders, and general FAQs handled flawlessly.',
      conversation: {
        user: '"I need to book a table for four tonight at 7 PM."',
        agent: '"Of course. We have a booth available in the garden area. Would you like me to secure that for you?"'
      },
      integration: 'Toast POS',
      latency: '380ms'
    },
    clinics: {
      title: 'Clinics',
      icon: 'medical_services',
      badge: 'HIPAA Ready',
      description: 'Appointment scheduling and patient intake with full privacy compliance.',
      conversation: {
        user: '"I need to reschedule my physical with Dr. Miller for next Tuesday afternoon."',
        agent: '"Searching... Dr. Miller has a 2:30 PM and a 4:00 PM slot available on Tuesday. Which works better for you?"'
      },
      integration: 'Epic Systems',
      latency: '420ms'
    },
    realestate: {
      title: 'Real Estate',
      icon: 'apartment',
      badge: 'MLS Ready',
      description: 'Qualify leads and book viewings while you\'re in the field.',
      conversation: {
        user: '"I\'m interested in seeing the property on Maple Street. Is it still available?"',
        agent: '"Yes, that property is available. I can schedule a viewing for tomorrow at 2 PM or Thursday at 11 AM. What works for you?"'
      },
      integration: 'MLS / Zillow',
      latency: '350ms'
    },
    ecommerce: {
      title: 'E-commerce',
      icon: 'shopping_bag',
      badge: 'Shopify+',
      description: 'Order status and basic returns via voice, integrated with your stack.',
      conversation: {
        user: '"Where is my order #VOX-1234? It was supposed to arrive yesterday."',
        agent: '"I see your order shipped on Monday. Looking at tracking, it\'s out for delivery today between 2-4 PM. Would you like me to text you when it arrives?"'
      },
      integration: 'Shopify / Magento',
      latency: '290ms'
    }
  };

  const features = [
    { icon: 'hub', title: 'Knowledge Graph', description: 'Agents learn complex relationships between your products and services.' },
    { icon: 'forum', title: 'Natural Voice', description: 'Human-like prosody and emotion detection for empathetic service.' },
    { icon: 'monitoring', title: 'Live Analytics', description: 'Watch calls live and intervene via dashboard if necessary.' },
    { icon: 'schedule', title: 'Always On', description: '24/7 coverage with zero latency and infinite scalability.' },
    { icon: 'calendar_today', title: 'Smart Scheduling', description: 'Two-way sync with Google, Outlook, and Cal.com.' },
    { icon: 'shield', title: 'SOC2 Type II', description: 'Enterprise-grade security and data encryption at rest.' },
    { icon: 'rocket_launch', title: 'Fast Deployment', description: 'Go from idea to live phone line in less than 5 minutes.' },
    { icon: 'language', title: 'Multi-lingual', description: 'Native support for 32+ languages and regional accents.' }
  ];

  return (
    <main className="bg-white text-zinc-800 font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100">
        <div className="flex justify-between items-center max-w-6xl mx-auto px-6 h-16">
          <div className="flex items-center gap-10">
            <a className="text-xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2" href="#">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              </div>
              VoxAgent
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors" href="#solutions">Solutions</a>
              <a className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors" href="#pricing">Pricing</a>
              <a className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors" href="#docs">Docs</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:block px-5 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Sign In</button>
            <button className="px-5 py-2 bg-zinc-900 text-white rounded-full text-sm font-medium shadow-sm hover:bg-zinc-700 transition-all active:scale-95">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-zinc-100 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-zinc-50 rounded-full blur-3xl opacity-50"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-600">Now with Real-time Reasoning</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl tracking-tight font-semibold text-zinc-900 mb-6">
            Voice Agents That{' '}
            <span className="italic font-light bg-gradient-to-r from-zinc-600 to-zinc-900 bg-clip-text text-transparent">Actually</span>
            {' '}Understand
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy human-level voice assistants powered by proprietary knowledge graphs.
            VoxAgent doesn't just talk—it solves, schedules, and grows your business 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium shadow-md hover:bg-zinc-700 transition-all active:scale-95">Start Free Trial</button>
            <button className="w-full sm:w-auto px-6 py-3 bg-white text-zinc-700 rounded-full text-sm font-medium border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-all">Schedule Demo</button>
          </div>




          {/* Simple Audio Visualizer */}
          <div className="mt-20 flex items-center justify-center gap-1">
            {[0.1, 0.2, 0.4, 0.3, 0.5, 0.2, 0.4, 0.3, 0.5, 0.2, 0.4, 0.3].map((delay, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: '0.8s',
                  height: `${16 + Math.sin(i) * 12}px`
                }}
              ></div>
            ))}
            <div className="mx-4 px-4 py-2 flex items-center gap-2">
              <Orb />
            </div>
            {[0.3, 0.5, 0.2, 0.4, 0.1, 0.6, 0.3, 0.5, 0.2, 0.4, 0.1, 0.6].map((delay, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: '0.8s',
                  height: `${18 + Math.cos(i) * 12}px`
                }}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-zinc-100 bg-zinc-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-8">Trusted by modern enterprises globally</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['VELOCITY', 'CYBERA', 'QUANTUM', 'NEXUS', 'ECLIPSE', 'APEX'].map((company) => (
              <div key={company} className="text-sm font-bold text-zinc-400 tracking-wider">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* About Product */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">Intelligent Conversations</span>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold text-zinc-900 mt-6 mb-5">
              More Than Just a Voice Bot
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-8">
              Traditional IVRs frustrate customers. VoxAgent uses large language models combined with your specific business data to provide nuanced, helpful, and natural interactions.
            </p>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center mt-0.5">
                  <span className="material-symbols-outlined text-white text-[12px]">check</span>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-800">Infinite Context Window</h4>
                  <p className="text-zinc-500 text-sm">Remembers user preferences across different calls.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center mt-0.5">
                  <span className="material-symbols-outlined text-white text-[12px]">check</span>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-800">Instant API Actions</h4>
                  <p className="text-zinc-500 text-sm">Actually performs tasks like booking, canceling, or updating.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            
          <Matrix
  rows={7}
  cols={7}
  frames={wave}
  fps={20}
  loop
  ariaLabel="Wave animation"
/>

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          <div className="text-center p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="text-4xl font-semibold text-zinc-900 mb-1">125k+</div>
            <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Calls Handled Monthly</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="text-4xl font-semibold text-zinc-900 mb-1">2,500+</div>
            <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Active Assistants</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="text-4xl font-semibold text-zinc-900 mb-1">94%</div>
            <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Resolution Rate</p>
          </div>
        </div>
      </section>

      {/* Use Cases Interactive Grid */}
      <section className="py-24" id="solutions">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold text-zinc-900">Tailored for your industry</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto mt-3">Pre-trained models designed for specific high-volume voice workflows.</p>
          </div>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              {Object.entries(useCases).map(([key, uc]) => (
                <button
                  key={key}
                  onClick={() => setActiveUseCase(key)}
                  className={`text-left p-5 rounded-xl transition-all duration-200 ${
                    activeUseCase === key
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'bg-white border border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow'
                  }`}
                >
                  <span className={`material-symbols-outlined mb-3 ${activeUseCase === key ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {uc.icon}
                  </span>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${activeUseCase === key ? 'text-white' : 'text-zinc-800'}`}>{uc.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${activeUseCase === key ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                      {uc.badge}
                    </span>
                  </div>
                  <p className={`text-sm ${activeUseCase === key ? 'text-zinc-400' : 'text-zinc-500'}`}>{uc.description}</p>
                </button>
              ))}
            </div>
            <div className="lg:col-span-5">
              <div className="bg-zinc-50 rounded-2xl p-6 h-full border border-zinc-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-5">Live Simulation: {useCases[activeUseCase as keyof typeof useCases].title}</h4>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl text-sm border border-zinc-100 shadow-sm">
                      {useCases[activeUseCase as keyof typeof useCases].conversation.user}
                    </div>
                    <div className="bg-zinc-900 text-white p-4 rounded-xl text-sm shadow-md">
                      {useCases[activeUseCase as keyof typeof useCases].conversation.agent}
                    </div>
                  </div>
                </div>
                <div className="pt-5 mt-5 border-t border-zinc-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Integration:</span>
                    <span className="font-medium text-zinc-800">{useCases[activeUseCase as keyof typeof useCases].integration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-zinc-500">Latency:</span>
                    <span className="font-medium text-zinc-800">{useCases[activeUseCase as keyof typeof useCases].latency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-zinc-900 text-white" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold">From zero to live in minutes</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mt-3">Our four-step deployment pipeline ensures your agent is smart before its first call.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Sync your knowledge base, CRM, and calendar effortlessly.' },
              { step: '02', title: 'Train', desc: 'Define personality, guardrails, and specific business goals.' },
              { step: '03', title: 'Deploy', desc: 'Go live on a local or toll-free number in any region.' },
              { step: '04', title: 'Analyze', desc: 'Review transcripts and sentiment analysis in real-time.' }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-semibold text-zinc-700 mb-4">{item.step}</div>
                <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-zinc-700 text-xl">{feature.icon}</span>
                </div>
                <h4 className="font-semibold text-zinc-800 mb-1">{feature.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-white px-3 py-1 rounded-full">Enterprise Grade</span>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold text-zinc-900 mt-6 mb-6">Scale with Confidence</h2>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-zinc-500 text-base">done_all</span>
                <span className="text-zinc-600">Dedicated Success Manager</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-zinc-500 text-base">done_all</span>
                <span className="text-zinc-600">Custom Model Fine-tuning</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-zinc-500 text-base">done_all</span>
                <span className="text-zinc-600">99.9% Uptime SLA</span>
              </div>
            </div>
            <button className="px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium shadow-md hover:bg-zinc-700 transition-all">Talk to Sales</button>
          </div>
          <div className="relative">
            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-zinc-700">public</span>
                </div>
                <h4 className="font-semibold text-xl text-zinc-800">Global Infrastructure</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-zinc-500">Global Latency</span>
                    <span className="font-semibold text-zinc-800">42ms</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-800 w-[95%] rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-0.5">Status</p>
                    <p className="font-semibold text-zinc-800 text-sm">Ready for Scale</p>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-0.5">Network</p>
                    <p className="font-semibold text-zinc-800 text-sm">Anycast Voice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="flex items-center justify-center">
          <DitherShader
                    src="https://images.unsplash.com/photo-1660631228116-b3643559f611?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    gridSize={2}
                    ditherMode="bayer"
                    colorMode="grayscale"
                    invert={false}
                    animated={false}
                    animationSpeed={0.02}
                    primaryColor="#000000"
                    secondaryColor="#f5f5f5"
                    threshold={0.5}
                    className="h-80 w-[500px] sm:h-96 sm:w-[600px]"
                  />
         
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-zinc-900 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-700 rounded-full blur-[80px] opacity-30 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-zinc-700 rounded-full blur-[60px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold text-white mb-6 relative z-10">
              Ready to transform your customer experience?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button className="w-full sm:w-auto px-8 py-3 bg-white text-zinc-900 rounded-full text-sm font-medium shadow-md hover:bg-zinc-100 transition-all active:scale-95">Start for Free</button>
              <button className="w-full sm:w-auto px-8 py-3 border border-zinc-700 text-white rounded-full text-sm font-medium hover:bg-white/5 transition-all">Book a Demo</button>
            </div>
            <p className="mt-6 text-zinc-500 text-sm">No credit card required. Setup takes 5 minutes.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <a className="text-lg font-semibold tracking-tight text-zinc-900 flex items-center gap-2 mb-4" href="#">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">graphic_eq</span>
              </div>
              VoxAgent
            </a>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              The intelligence layer for the voice-first world. Build, train, and deploy sovereign voice agents in minutes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Technology</a></li>
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Voice Design</a></li>
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a className="hover:text-zinc-800 transition-colors" href="#">About</a></li>
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Security</a></li>
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Legal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Support</a></li>
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Sales</a></li>
              <li><a className="hover:text-zinc-800 transition-colors" href="#">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-zinc-400">
          <p>© 2024 VoxAgent AI. Precise voice AI for the modern enterprise.</p>
          <div className="flex items-center gap-5">
            <a className="hover:text-zinc-700 transition-colors" href="#">Privacy</a>
            <a className="hover:text-zinc-700 transition-colors" href="#">Terms</a>
            <a className="hover:text-zinc-700 transition-colors" href="#">Cookies</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </main>
  );
}