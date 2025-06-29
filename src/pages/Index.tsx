import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Eye, Zap, Shield, Search, Globe, Users, Award, Star, Clock, Target, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Index = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    score: 0,
    issues: [],
    suggestions: []
  });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Make API call to Spring Boot backend with URL as query parameter
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`https://accessibility-analyzer-production.up.railway.app/api/analyze-url?url=${encodedUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform backend response to match frontend expectations
      const transformedResults = {
        score: data.score,
        issues: data.issues.map((issue: any) => ({
          type: getIssueType(issue.type),
          title: getIssueTitle(issue.type),
          description: issue.description,
          severity: getIssueSeverity(issue.type),
          element: issue.element
        })),
        suggestions: generateSuggestions(data.issues)
      };
      
      setAnalysisResults(transformedResults);
      setHasResults(true);
      
      toast({
        title: "Analysis Complete",
        description: data.message || `Found ${data.issues.length} accessibility issues`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the website. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions to transform backend data
  const getIssueType = (backendType: string) => {
    const typeMap: { [key: string]: string } = {
      'INPUT_MISSING_LABEL': 'error',
      'MISSING_ALT_TEXT': 'error',
      'LOW_CONTRAST': 'warning',
      'MISSING_HEADING': 'warning',
      'MISSING_ARIA_LABEL': 'info'
    };
    return typeMap[backendType] || 'info';
  };

  const getIssueTitle = (backendType: string) => {
    const titleMap: { [key: string]: string } = {
      'INPUT_MISSING_LABEL': 'Missing Input Labels',
      'MISSING_ALT_TEXT': 'Missing Alt Text',
      'LOW_CONTRAST': 'Low Color Contrast',
      'MISSING_HEADING': 'Missing Heading Structure',
      'MISSING_ARIA_LABEL': 'Missing ARIA Labels'
    };
    return titleMap[backendType] || 'Accessibility Issue';
  };

  const getIssueSeverity = (backendType: string) => {
    const severityMap: { [key: string]: string } = {
      'INPUT_MISSING_LABEL': 'high',
      'MISSING_ALT_TEXT': 'high',
      'LOW_CONTRAST': 'medium',
      'MISSING_HEADING': 'medium',
      'MISSING_ARIA_LABEL': 'low'
    };
    return severityMap[backendType] || 'low';
  };

  const generateSuggestions = (issues: any[]) => {
    const suggestions: string[] = [];
    const issueTypes = issues.map(issue => issue.type);
    
    if (issueTypes.includes('INPUT_MISSING_LABEL')) {
      suggestions.push('Add descriptive labels to all form input fields');
    }
    if (issueTypes.includes('MISSING_ALT_TEXT')) {
      suggestions.push('Add alternative text to all images for screen readers');
    }
    if (issueTypes.includes('LOW_CONTRAST')) {
      suggestions.push('Increase color contrast for better text readability');
    }
    if (issueTypes.includes('MISSING_HEADING')) {
      suggestions.push('Implement proper heading hierarchy (h1, h2, h3, etc.)');
    }
    if (issueTypes.includes('MISSING_ARIA_LABEL')) {
      suggestions.push('Add ARIA labels to interactive elements');
    }
    
    // Add general suggestions if no specific issues found
    if (suggestions.length === 0) {
      suggestions.push('Ensure all interactive elements are keyboard accessible');
      suggestions.push('Test your website with screen readers');
      suggestions.push('Add skip navigation links for better accessibility');
    }
    
    return suggestions;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info": return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: { [key: string]: "destructive" | "secondary" | "outline" } = {
      high: "destructive",
      medium: "secondary",
      low: "outline"
    };
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3 group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AccessibilityPro
                </h1>
                <p className="text-xs text-slate-500 font-medium">WCAG Compliance Made Simple</p>
              </div>
            </motion.div>
            <nav className="hidden md:flex space-x-8">
              {[
                { href: "#features", text: "Features" },
                { href: "#how-it-works", text: "How it Works" },
                { href: "#pricing", text: "Pricing" }
              ].map((item, index) => (
                <motion.a 
                  key={item.href}
                  href={item.href} 
                  className="text-slate-700 hover:text-purple-600 transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-purple-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {item.text}
                </motion.a>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-32 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0] 
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Trust indicators */}
          <motion.div 
            className="flex justify-center items-center space-x-6 mb-8 text-sm text-slate-600"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Star, text: "4.9/5 Rating", color: "text-amber-500" },
              { icon: Users, text: "10K+ Sites Analyzed", color: "text-purple-500" },
              { icon: Clock, text: "Under 30s Analysis", color: "text-emerald-500" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center space-x-2"
                variants={fadeInUp}
              >
                <item.icon className={`h-4 w-4 ${item.color} ${item.icon === Star ? 'fill-current' : ''}`} />
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.h2 
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Make Your Website
            <br />
            <motion.span 
              className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Accessible to All
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Get instant WCAG compliance reports, fix accessibility issues, and create inclusive web experiences. 
            <span className="font-semibold text-slate-700"> Trusted by 10,000+ developers worldwide.</span>
          </motion.p>
          
          {/* URL Input Section */}
          <motion.div 
            className="max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Card className="p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Start Your Free Analysis</h3>
                <p className="text-slate-600">Enter your website URL and get detailed accessibility insights in seconds</p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://your-website.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-14 text-lg border-2 border-slate-200 focus:border-purple-500 transition-all duration-300 rounded-xl"
                    disabled={isAnalyzing}
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl rounded-xl"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-3" />
                        Analyze Now
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-6 flex justify-center items-center space-x-4 text-sm text-slate-500"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  "Free forever",
                  "No registration required", 
                  "Instant results"
                ].map((text, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-1"
                    variants={fadeInUp}
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>{text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          </motion.div>

          {/* Results Section */}
          {hasResults && (
            <motion.div 
              className="max-w-7xl mx-auto mt-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-8 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <motion.div 
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-4xl font-bold mb-4 text-slate-800">Your Accessibility Report</h3>
                  <p className="text-lg text-slate-600">Comprehensive analysis for: <span className="font-semibold text-purple-600">{url}</span></p>
                </motion.div>

                {/* Score Overview */}
                <motion.div 
                  className="grid md:grid-cols-3 gap-8 mb-12"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true }}
                >
                  {[
                    {
                      icon: TrendingUp,
                      title: "Accessibility Score",
                      value: `${analysisResults.score}%`,
                      description: analysisResults.score >= 90 ? "Excellent!" : analysisResults.score >= 70 ? "Good progress" : "Needs improvement",
                      gradient: "from-emerald-50 to-purple-50",
                      iconGradient: "from-emerald-500 to-purple-500",
                      color: getScoreColor(analysisResults.score)
                    },
                    {
                      icon: AlertTriangle,
                      title: "Issues Found",
                      value: analysisResults.issues.length,
                      description: "Critical accessibility barriers detected",
                      gradient: "from-amber-50 to-orange-50",
                      iconGradient: "from-amber-500 to-orange-500",
                      color: "text-amber-600"
                    },
                    {
                      icon: Target,
                      title: "Recommendations",
                      value: analysisResults.suggestions.length,
                      description: "Actionable improvements to implement",
                      gradient: "from-purple-50 to-pink-50",
                      iconGradient: "from-purple-500 to-pink-500",
                      color: "text-purple-600"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    >
                      <Card className={`text-center p-8 bg-gradient-to-br ${item.gradient} border-0 hover:shadow-xl transition-all duration-300`}>
                        <CardHeader>
                          <motion.div 
                            className={`mx-auto w-20 h-20 bg-gradient-to-br ${item.iconGradient} rounded-full flex items-center justify-center mb-4`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <item.icon className="h-10 w-10 text-white" />
                          </motion.div>
                          <CardTitle className="text-2xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-5xl font-bold mb-4 ${item.color}`}>
                            {item.value}
                          </div>
                          {item.title === "Accessibility Score" && (
                            <Progress value={analysisResults.score} className="h-3 mb-4" />
                          )}
                          <p className="text-slate-600 font-medium">{item.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Detailed Results */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Tabs defaultValue="issues" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 rounded-xl">
                      <TabsTrigger value="issues" className="text-lg font-semibold transition-all duration-300 rounded-lg">Issues & Violations</TabsTrigger>
                      <TabsTrigger value="suggestions" className="text-lg font-semibold transition-all duration-300 rounded-lg">Recommendations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="issues" className="space-y-6 mt-8">
                      {analysisResults.issues.map((issue: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Alert className="flex items-start space-x-4 p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
                            <div className="flex-shrink-0">
                              {getIssueIcon(issue.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-lg text-slate-800">{issue.title}</h4>
                                {getSeverityBadge(issue.severity)}
                              </div>
                              <AlertDescription className="text-slate-600 text-base">{issue.description}</AlertDescription>
                            </div>
                          </Alert>
                        </motion.div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="suggestions" className="space-y-6 mt-8">
                      {analysisResults.suggestions.map((suggestion: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Alert className="flex items-start space-x-4 p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-emerald-500 mt-1" />
                            </div>
                            <AlertDescription className="flex-1 text-slate-600 text-base font-medium">{suggestion}</AlertDescription>
                          </Alert>
                        </motion.div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={fadeInUp}
          >
            <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Why Choose AccessibilityPro?
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Professional-grade accessibility testing with enterprise features, designed for developers and businesses who care about inclusive design.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                icon: Eye,
                title: "Advanced Visual Analysis",
                description: "AI-powered color contrast detection, text readability analysis, and visual accessibility compliance checking",
                gradient: "from-purple-50 to-pink-50",
                iconGradient: "from-purple-500 to-pink-500",
                hoverColor: "group-hover:text-purple-600"
              },
              {
                icon: Zap,
                title: "Lightning-Fast Reports",
                description: "Get comprehensive accessibility reports in under 30 seconds with detailed recommendations and priority rankings",
                gradient: "from-emerald-50 to-teal-50",
                iconGradient: "from-emerald-500 to-teal-500",
                hoverColor: "group-hover:text-emerald-600"
              },
              {
                icon: Award,
                title: "WCAG 2.1 AA Certified",
                description: "Ensure full compliance with international accessibility standards and legal requirements",
                gradient: "from-amber-50 to-orange-50",
                iconGradient: "from-amber-500 to-orange-500",
                hoverColor: "group-hover:text-amber-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
              >
                <Card className={`p-8 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br ${feature.gradient} group`}>
                  <CardHeader>
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.iconGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className={`text-2xl font-bold ${feature.hoverColor} transition-colors duration-300`}>
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600 mt-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section 
        id="how-it-works" 
        className="py-24 bg-gradient-to-br from-slate-50 to-purple-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={fadeInUp}
          >
            <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              How It Works
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Three simple steps to make your website accessible to everyone</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                number: "1",
                title: "Enter Your URL",
                description: "Simply paste your website URL and our AI begins comprehensive accessibility scanning",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                number: "2",
                title: "AI-Powered Analysis",
                description: "Advanced algorithms test for WCAG compliance, usability issues, and accessibility barriers",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                number: "3",
                title: "Get Actionable Results",
                description: "Receive detailed reports with prioritized fixes and step-by-step implementation guides",
                gradient: "from-amber-500 to-orange-500"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                variants={fadeInUp}
              >
                <motion.div 
                  className={`bg-gradient-to-br ${step.gradient} text-white rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:shadow-2xl`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.number}
                </motion.div>
                <h4 className="text-2xl font-bold mb-4 text-slate-800">{step.title}</h4>
                <p className="text-lg text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="bg-slate-900 text-white py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid md:grid-cols-4 gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="md:col-span-2"
              variants={fadeInLeft}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">AccessibilityPro</span>
                  <p className="text-slate-400 text-sm">Making the web accessible for everyone</p>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                Professional accessibility testing trusted by developers and businesses worldwide. Create inclusive digital experiences that work for everyone.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h5 className="font-bold mb-6 text-lg">Features</h5>
              <ul className="space-y-3 text-slate-300">
                {["WCAG Compliance", "Visual Analysis", "Instant Reports", "API Access"].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={fadeInRight}>
              <h5 className="font-bold mb-6 text-lg">Company</h5>
              <ul className="space-y-3 text-slate-300">
                {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p>&copy; 2025 AccessibilityPro. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
