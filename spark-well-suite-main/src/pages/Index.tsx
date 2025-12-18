import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BarChart3, Heart, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "Smart Journal",
    description: "Log tasks with difficulty, tags, and blockers. Never lose track of your progress.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize productivity patterns and identify your peak performance hours.",
  },
  {
    icon: Heart,
    title: "Health Tracking",
    description: "Monitor screen time, sleep, and hydration to prevent burnout.",
  },
  {
    icon: Zap,
    title: "AI Insights",
    description: "Get intelligent suggestions based on your work patterns and health data.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold text-foreground">DevFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Developer Productivity Reimagined
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 font-display text-5xl font-bold leading-tight text-foreground sm:text-6xl md:text-7xl"
          >
            Track Your{" "}
            <span className="gradient-text">Productivity</span>
            <br />& Well-Being
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            A smart platform for developers and students to track daily work, identify productivity patterns, and maintain mental & physical well-being.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/login">
              <Button size="lg" className="group px-8">
                Start Tracking
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="container mx-auto grid grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Tasks Logged" },
            { value: "95%", label: "User Satisfaction" },
            { value: "30%", label: "Productivity Boost" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Stay Productive
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Powerful features designed to help you understand your work patterns and optimize your daily routine.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card p-6 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center"
          >
            <div className="absolute inset-0 -z-10 opacity-30">
              <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary-glow blur-3xl" />
              <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary-glow blur-3xl" />
            </div>
            <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Boost Your Productivity?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join thousands of developers who are already tracking their work and improving their well-being with DevFlow.
            </p>
            <Link to="/login" className="mt-8 inline-block">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">DevFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 DevFlow. Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
