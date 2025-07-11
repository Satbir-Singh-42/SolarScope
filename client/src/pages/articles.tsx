import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, TrendingUp, Zap, Leaf, DollarSign, Search, Filter, ChevronRight, ExternalLink, X, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  readTime: number;
  trending: boolean;
  tags: string[];
  imageUrl?: string;
  source: string;
  url?: string;
}

interface NewsData {
  articles: Article[];
  categories: string[];
  trending: Article[];
}

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch latest solar news using AI
  const { data: newsData, isLoading, error } = useQuery<NewsData>({
    queryKey: ['/api/solar-news'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/solar-news');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch solar news:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (newsData?.articles) {
      let filtered = newsData.articles;
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(article => article.category === selectedCategory);
      }
      
      if (searchQuery) {
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      setFilteredArticles(filtered);
    }
  }, [newsData, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'environment': return <Leaf className="w-4 h-4" />;
      case 'market': return <DollarSign className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading latest solar industry news...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load articles. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-16">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Newspaper className="text-white" size={20} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Solar Industry News</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</button>
              </Link>
              <Link href="/chat">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">AI Assistant</button>
              </Link>
              <Link href="/about">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">About</button>
              </Link>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Articles
              </Button>
            </nav>
            <div className="md:hidden">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Latest Solar Industry News</h2>
            <p className="text-xl text-blue-100 mb-6">Stay updated with the latest developments in solar technology, market trends, and industry insights</p>
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Zap className="w-4 h-4 mr-1" />
                Real-time Updates
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Leaf className="w-4 h-4 mr-1" />
                Industry Insights
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles, topics, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {newsData?.categories?.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="latest" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest">Latest News</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-6">
            {/* Featured Article */}
            {filteredArticles && filteredArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-l-4 border-l-blue-600">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {getCategoryIcon(filteredArticles[0].category)}
                            <span className="ml-1">Featured</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(filteredArticles[0].publishedAt)}
                          </span>
                        </div>
                        <CardTitle className="text-2xl leading-tight">
                          {filteredArticles[0].title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {filteredArticles[0].summary}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {filteredArticles[0].readTime} min read
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Source: {filteredArticles[0].source}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReadMore(filteredArticles[0])}
                      >
                        Read More <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.slice(1).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleReadMore(article)}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(article.category)}
                          <span className="ml-1">{article.category}</span>
                        </Badge>
                        {article.trending && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {article.readTime} min
                        </div>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsData?.trending?.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-100 text-orange-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          #{index + 1} Trending
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription>{article.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime} min read
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleReadMore(article)}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-l-4 border-l-green-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    AI Market Analysis
                  </CardTitle>
                  <CardDescription>
                    Real-time insights powered by artificial intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Market Growth</h3>
                      <p className="text-sm text-gray-600">+15.2% this quarter</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Efficiency Gains</h3>
                      <p className="text-sm text-gray-600">22.8% average panel efficiency</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Cost Reduction</h3>
                      <p className="text-sm text-gray-600">-12% installation costs</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Solar panel efficiency continues to improve with new perovskite technology</li>
                      <li>• Installation costs dropping due to streamlined manufacturing processes</li>
                      <li>• Government incentives driving adoption in residential markets</li>
                      <li>• Energy storage integration becoming standard practice</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Reading Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {selectedArticle && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getCategoryIcon(selectedArticle.category)}
                      <span className="ml-1">{selectedArticle.category}</span>
                    </Badge>
                    <span>{formatDate(selectedArticle.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.readTime} min read
                  </div>
                  <span>Source: {selectedArticle.source}</span>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {selectedArticle.summary}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedArticle.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
            {selectedArticle?.url && (
              <Button onClick={() => window.open(selectedArticle.url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Read Original
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}