import { Link } from '@inertiajs/react';
import React from 'react';
import { FiSearch, FiCode, FiBookOpen, FiMessageSquare } from 'react-icons/fi';

const HeroSection = () => {
    return (
        <section className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left side - Text content */}
                    <div className="lg:w-1/2 space-y-8">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            Intelligent Documentation <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                                Powered by AI
                            </span>
                        </h1>

                        <p className="text-xl text-blue-100 max-w-lg">
                            Get instant, accurate answers to your technical questions.
                            Our AI understands your project's documentation and provides
                            context-aware solutions.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">

                            <Link href={route("login")}>
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105">
                                    Get Started
                                </button>
                            </Link>

                            {/* <button className="bg-transparent border-2 border-blue-400 text-blue-100 hover:bg-blue-900 px-6 py-3 rounded-lg font-medium transition-all">
                                View Demo
                            </button> */}
                        </div>
                    </div>

                    {/* Right side - Feature cards */}
                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard
                            icon={<FiSearch className="w-6 h-6" />}
                            title="Smart Search"
                            description="Find answers in your docs with natural language queries"
                        />
                        <FeatureCard
                            icon={<FiCode className="w-6 h-6" />}
                            title="Code Examples"
                            description="Get relevant code snippets for your specific use case"
                        />
                        <FeatureCard
                            icon={<FiBookOpen className="w-6 h-6" />}
                            title="Docs Generation"
                            description="Automatically create documentation from your codebase"
                        />
                        <FeatureCard
                            icon={<FiMessageSquare className="w-6 h-6" />}
                            title="Context-Aware"
                            description="Understands your project's specific terminology"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-blue-400 transition-all">
            <div className="text-blue-300 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-blue-100">{description}</p>
        </div>
    );
};

export default HeroSection;