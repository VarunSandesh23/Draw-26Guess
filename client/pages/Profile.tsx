import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout, updateUserProfile } from '../lib/firebase';
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
  Zap,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '../components/ui/theme-toggle';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(false);

  // Update editedName when userProfile loads
  useEffect(() => {
    if (userProfile?.displayName) {
      setEditedName(userProfile.displayName);
    } else if (userProfile && !userProfile.displayName) {
      // If profile exists but has no displayName, set a default
      setEditedName('Anonymous Player');
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    console.log('Saving profile with name:', editedName);

    if (!editedName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    if (!user) {
      toast.error('User not found');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating user profile for UID:', user.uid);
      const success = await updateUserProfile(user.uid, {
        displayName: editedName.trim()
      });

      console.log('Update result:', success);

      if (success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile - please try again');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(`Update failed: ${error}`);
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

  // Define achievements with enhanced descriptions matching the design
  const achievements = [
    {
      id: 'first_victory',
      name: 'First Victory',
      description: 'Congratulations on winning your very first game! Every master artist started with their first masterpiece.',
      icon: Trophy,
      unlocked: gamesWon >= 1,
      color: 'text-game-teal',
      requirement: 'Win your first game'
    },
    {
      id: 'artist',
      name: 'Artist',
      description: 'You\'ve played 10 games and are becoming a true drawing artist! Your creativity knows no bounds.',
      icon: Palette,
      unlocked: gamesPlayed >= 10,
      color: 'text-game-purple',
      requirement: 'Play 10 games'
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'With 5 victories under your belt, you\'re proving to be a formidable competitor!',
      icon: Crown,
      unlocked: gamesWon >= 5,
      color: 'text-game-orange',
      requirement: 'Win 5 games'
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'You\'ve accumulated an impressive 1000 total points! Your guessing and drawing skills are exceptional.',
      icon: Star,
      unlocked: totalScore >= 1000,
      color: 'text-game-success',
      requirement: 'Reach 1000 total points'
    },
    {
      id: 'win_streak',
      name: 'Win Streak',
      description: 'Maintaining an 80% win rate shows consistent excellence. You\'re in the top tier of players!',
      icon: Zap,
      unlocked: winRate >= 80 && gamesPlayed >= 5,
      color: 'text-game-warning',
      requirement: 'Maintain 80% win rate with 5+ games'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Quick thinking and faster drawing! You excel at rapid-fire rounds.',
      icon: Clock,
      unlocked: false, // This could be based on average time to guess
      color: 'text-game-teal',
      requirement: 'Guess 5 words in under 10 seconds each'
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
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
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

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{Math.round((unlockedAchievements.length / achievements.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-game-purple to-game-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Achievement Design Reference & Progress */}
                <div className="mb-6 p-6 bg-gradient-to-r from-game-purple/5 to-game-teal/5 rounded-2xl border border-game-purple/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-game-purple to-game-teal rounded-full"></div>
                      <span className="font-medium text-foreground">Achievement Gallery</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Progress: {unlockedAchievements.length}/{achievements.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <h4 className="font-semibold mb-2">Design Inspiration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Clean, modern achievement cards with clear visual hierarchy and engaging unlock states.
                      </p>
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-game-success rounded-full"></div>
                        <span className="text-xs text-muted-foreground">Unlocked</span>
                        <div className="w-4 h-4 bg-gray-300 dark:bg-muted rounded-full ml-4"></div>
                        <span className="text-xs text-muted-foreground">Locked</span>
                      </div>
                    </div>

                    <div className="relative">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fd926398ea245443c9b9cde312e68afa5%2Fdce4c8e486e7490eba27a9be1ec43b99?format=webp&width=800"
                        alt="Achievement Cards Design Reference"
                        className="w-full rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.id}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-white dark:bg-card border-game-purple/30 shadow-lg hover:shadow-xl'
                            : 'bg-gray-50 dark:bg-muted/20 border-gray-200 dark:border-muted opacity-60'
                        }`}
                        whileHover={achievement.unlocked ? { scale: 1.03, y: -5 } : {}}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {achievement.unlocked && (
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-game-success rounded-full flex items-center justify-center border-2 border-white">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}

                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-game-purple/20 to-game-teal/20 border-2 border-game-purple/30'
                              : 'bg-gray-100 dark:bg-muted border-2 border-gray-200 dark:border-muted'
                          }`}>
                            <IconComponent className={`w-8 h-8 ${
                              achievement.unlocked ? achievement.color : 'text-gray-400 dark:text-muted-foreground'
                            }`} />
                          </div>

                          <h4 className={`font-bold text-lg mb-2 ${
                            achievement.unlocked ? 'text-foreground' : 'text-gray-400 dark:text-muted-foreground'
                          }`}>
                            {achievement.name}
                          </h4>

                          <p className={`text-sm leading-relaxed ${
                            achievement.unlocked ? 'text-muted-foreground' : 'text-gray-400 dark:text-muted-foreground'
                          }`}>
                            {achievement.description}
                          </p>

                          {achievement.unlocked && (
                            <motion.div
                              className="mt-4 px-3 py-1 bg-game-success/10 text-game-success text-xs font-medium rounded-full inline-block"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Unlocked!
                            </motion.div>
                          )}

                          {!achievement.unlocked && (
                            <div className="mt-4 px-3 py-1 bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground text-xs font-medium rounded-full inline-block">
                              Locked
                            </div>
                          )}
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
