'use client';
import { useRouter } from 'expo-router';
import { ArrowRight, BarChart3, MapPin, Shield, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const router = useRouter();
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent animate-pulse"></div>
                        <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            MerchandisingTeam
                        </span>
                    </div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a href="#features" className="hover:text-accent transition-colors" onClick={() => router.push('/features')}>
                            Features
                        </a>
                        <a href="#capabilities" className="hover:text-accent transition-colors" onClick={() => router.push('/capabilities')}>
                            Capabilities
                        </a>
                        <a href="#pricing" className="hover:text-accent transition-colors">
                            Pricing
                        </a>
                    </div>
                    <div className="flex gap-4">
                        <button className="hidden sm:block px-6 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                            Sign In
                        </button>
                        <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-foreground font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
                {/* Animated gradient background */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `linear-gradient(135deg, #F9E3B2 0%, #A2DFF7 50%, #F1D298 100%)`,
                        backgroundSize: '400% 400%',
                        animation: 'gradient-shift 8s ease infinite',
                        transform: `translateY(${scrollY * 0.5}px)`,
                    }}
                />

                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8" style={{ animation: 'fadeInUp 1s ease-out' }}>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                        Manage Field Operations
                        <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            With Precision
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        Real-time merchandising coordination, GPS tracking, and instant event reporting. Empower your teams with intelligent operations management.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <a
                            onClick={() => router.push('/login')}
                            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-foreground shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button onClick={() => router.push('/about')} className="px-8 py-4 rounded-lg border-2 border-foreground/20 font-semibold hover:bg-foreground/10 transition-all duration-300">
                            Watch Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-12">
                        <div style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }} className="p-4 rounded-lg bg-card/60 backdrop-blur-sm border border-border">
                            <div className="text-3xl font-bold text-primary">500+</div>
                            <div className="text-sm text-foreground/70">Active Users</div>
                        </div>
                        <div style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }} className="p-4 rounded-lg bg-card/60 backdrop-blur-sm border border-border">
                            <div className="text-3xl font-bold text-accent">99.9%</div>
                            <div className="text-sm text-foreground/70">Uptime</div>
                        </div>
                        <div style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }} className="p-4 rounded-lg bg-card/60 backdrop-blur-sm border border-border col-span-2 md:col-span-1">
                            <div className="text-3xl font-bold text-secondary">24/7</div>
                            <div className="text-sm text-foreground/70">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 relative">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                        <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
                        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                            Everything you need to streamline field merchandising operations
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Feature 1 */}
                        <div
                            style={{ animation: 'slideInLeft 0.8s ease-out 0.2s both' }}
                            className="group p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">GPS Tracking</h3>
                            <p className="text-foreground/70">
                                Real-time location tracking for all field teams with geofencing capabilities and automated check-ins.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div
                            style={{ animation: 'slideInRight 0.8s ease-out 0.3s both' }}
                            className="group p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Advanced Analytics</h3>
                            <p className="text-foreground/70">
                                Comprehensive dashboards with real-time insights, performance metrics, and trend analysis.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div
                            style={{ animation: 'slideInLeft 0.8s ease-out 0.4s both' }}
                            className="group p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Team Management</h3>
                            <p className="text-foreground/70">
                                Effortlessly manage supervisors and merchandisers with role-based access and performance tracking.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div
                            style={{ animation: 'slideInRight 0.8s ease-out 0.5s both' }}
                            className="group p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Instant Reporting</h3>
                            <p className="text-foreground/70">
                                Event-based reporting with photo uploads, automated notifications, and instant escalation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section id="capabilities" className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary/10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div style={{ animation: 'fadeInUp 0.8s ease-out' }} className="space-y-8">
                            <h2 className="text-4xl font-bold">
                                Built for
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                    Modern Operations
                                </span>
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Enterprise Security</h4>
                                        <p className="text-foreground/70">Bank-level encryption and compliance with all industry standards</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Lightning Fast</h4>
                                        <p className="text-foreground/70">Optimized for performance on any network condition</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-5 h-5 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Collaborative</h4>
                                        <p className="text-foreground/70">Real-time collaboration between teams across all levels</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ animation: 'slideInRight 0.8s ease-out 0.3s both' }} className="relative">
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5">
                                <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <BarChart3 className="w-16 h-16 text-primary mx-auto" />
                                        <p className="text-sm text-foreground/70">Advanced Dashboard Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                    <h2 className="text-4xl md:text-5xl font-bold">
                        Ready to Transform Your
                        <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Operations?
                        </span>
                    </h2>
                    <p className="text-xl text-foreground/70">
                        Join hundreds of organizations managing their field operations more effectively
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-foreground shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 mx-auto block">
                        Start Your Free Trial Today
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-card/30 py-12 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <h4 className="font-bold">Product</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Security
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold">Company</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Careers
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold">Resources</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    API Docs
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold">Legal</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Terms
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-border pt-8 text-center text-sm text-foreground/70">
                    <p>&copy; 2024 MerchandisingTeam. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
