import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Trophy, 
  Star, 
  GamepadIcon,
  Edit3,
  Save,
  X,
  Camera,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Crown,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userProfile?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would update the Firebase user profile
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Calculate user stats and achievements
  const gamesPlayed = userProfile?.gamesPlayed || 0;
  const gamesWon = userProfile?.gamesWon || 0;
  const totalScore = userProfile?.totalScore || 0;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;

  // Define achievements
  const achievements = [
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      icon: Trophy,
      unlocked: gamesWon >= 1,
      color: 'text-game-teal'
    },
    {
      id: 'artist',
      name: 'Artist',
      description: 'Play 10 games',
      icon: GamepadIcon,
      unlocked: gamesPlayed >= 10,
      color: 'text-game-purple'
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'Win 5 games',
      icon: Crown,
      unlocked: gamesWon >= 5,
      color: 'text-game-orange'
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Reach 1000 total points',
      icon: Star,
      unlocked: totalScore >= 1000,
      color: 'text-game-success'
    },
    {
      id: 'streaker',
      name: 'Win Streak',
      description: 'Maintain 80% win rate',
      icon: Zap,
      unlocked: winRate >= 80 && gamesPlayed >= 5,
      color: 'text-game-warning'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 bg-game-purple/20 rounded-full blur-3xl"
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-48 h-48 bg-game-teal/20 rounded-full blur-3xl"
          animate={{ y: [10, -10, 10], rotate: [2, -2, 2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <Card className="text-center">
              <CardHeader>
                <div className="relative mx-auto">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={userProfile?.photoURL} alt={userProfile?.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-game-purple to-game-teal text-white text-2xl">
                      {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-2 right-1/2 translate-x-1/2 w-8 h-8 bg-game-purple hover:bg-game-purple-dark rounded-full flex items-center justify-center text-white transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex-1 bg-game-success hover:bg-game-success/80"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(userProfile?.displayName || '');
                        }}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="text-2xl">{userProfile?.displayName}</CardTitle>
                      <CardDescription className="flex items-center justify-center gap-2 mt-2">
                        <Mail className="w-4 h-4" />
                        {userProfile?.email}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Recently'}
                </div>
                
                <Separator />
                
                <Button 
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats and Achievements */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Game Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Game Statistics
                </CardTitle>
                <CardDescription>Your performance across all games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-game-purple/10 rounded-lg border border-game-purple/20">
                    <GamepadIcon className="w-6 h-6 text-game-purple mx-auto mb-2" />
                    <p className="text-2xl font-bold text-game-purple">{gamesPlayed}</p>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                  </div>
                  
                  <div className="text-center p-4 bg-game-teal/10 rounded-lg border border-game-teal/20">
                    <Trophy className="w-6 h-6 text-game-teal mx-auto mb-2" />
                    <p className="text-2xl font-bold text-game-teal">{gamesWon}</p>
                    <p className="text-sm text-muted-foreground">Games Won</p>
                  </div>
                  
                  <div className="text-center p-4 bg-game-orange/10 rounded-lg border border-game-orange/20">
                    <Star className="w-6 h-6 text-game-orange mx-auto mb-2" />
                    <p className="text-2xl font-bold text-game-orange">{totalScore}</p>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                  </div>
                  
                  <div className="text-center p-4 bg-game-success/10 rounded-lg border border-game-success/20">
                    <TrendingUp className="w-6 h-6 text-game-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-game-success">{winRate}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold">{averageScore}</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold">{gamesPlayed - gamesWon}</p>
                    <p className="text-sm text-muted-foreground">Games Lost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                  <Badge variant="secondary" className="ml-auto">
                    {unlockedAchievements.length}/{achievements.length}
                  </Badge>
                </CardTitle>
                <CardDescription>Unlock achievements by playing and winning games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all ${
                          achievement.unlocked
                            ? 'bg-gradient-to-r from-background to-card border-border shadow-md'
                            : 'bg-muted/30 border-muted opacity-50'
                        }`}
                        whileHover={achievement.unlocked ? { scale: 1.02 } : {}}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-br from-game-purple/20 to-game-teal/20' 
                              : 'bg-muted'
                          }`}>
                            <IconComponent className={`w-5 h-5 ${
                              achievement.unlocked ? achievement.color : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{achievement.name}</h4>
                              {achievement.unlocked && (
                                <Badge className="bg-game-success text-xs">
                                  Unlocked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {unlockedAchievements.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start playing games to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
