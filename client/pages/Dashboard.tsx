import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createRoom, logout } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Palette,
  Plus,
  Users,
  Trophy,
  Star,
  LogOut,
  GamepadIcon,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from '../components/ui/theme-toggle';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateRoom = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const newRoomCode = await createRoom(user.uid);
      navigate(`/lobby/${newRoomCode}`);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (roomCode.trim()) {
      const code = roomCode.toUpperCase();

      // Check if room exists before navigating
      try {
        const room = await import("../lib/firebase").then((fb) =>
          fb.getRoom(code),
        );
        if (room) {
          navigate(`/lobby/${code}`);
          setJoinDialogOpen(false);
        } else {
          // Show error dialog
          setErrorMessage("Room not found. Please check the room code and try again.");
          setErrorDialogOpen(true);
          setJoinDialogOpen(false);
        }
      } catch (error) {
        console.error("Error checking room:", error);
        // If there's an error, still navigate (might be a network issue)
        navigate(`/lobby/${code}`);
        setJoinDialogOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-5, 5, -5],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-20 w-48 h-48 bg-game-teal/20 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-game-orange/20 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-game-purple to-game-teal rounded-xl shadow-game-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Palette className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-game-purple via-game-teal to-game-orange bg-clip-text text-transparent">
                Draw & Guess
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {userProfile?.displayName}!
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <motion.div
            variants={itemVariants}
            className="hidden md:block"
          >
            <ThemeToggle />
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            variants={itemVariants}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 bg-card/50 backdrop-blur-sm border rounded-full px-4 py-2 hover:bg-card/70 transition-colors cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={userProfile?.photoURL}
                  alt={userProfile?.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-game-purple to-game-teal text-white text-sm">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{userProfile?.displayName}</p>
                <p className="text-muted-foreground text-xs">
                  Score: {userProfile?.totalScore || 0}
                </p>
              </div>
            </motion.button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={itemVariants}
        >
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-game-purple/20 to-game-purple/10 border-game-purple/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Games Played
                    </p>
                    <p className="text-3xl font-bold text-game-purple">
                      {userProfile?.gamesPlayed || 0}
                    </p>
                  </div>
                  <GamepadIcon className="w-8 h-8 text-game-purple" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-game-teal/20 to-game-teal/10 border-game-teal/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Games Won
                    </p>
                    <p className="text-3xl font-bold text-game-teal">
                      {userProfile?.gamesWon || 0}
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-game-teal" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-game-orange/20 to-game-orange/10 border-game-orange/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Score
                    </p>
                    <p className="text-3xl font-bold text-game-orange">
                      {userProfile?.totalScore || 0}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-game-orange" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={itemVariants}
        >
          {/* Create Room Card */}
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="relative overflow-hidden bg-gradient-to-br from-game-purple/10 to-game-purple/5 border-game-purple/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-game-purple/5 to-transparent" />
              <CardHeader className="relative z-10">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-game-purple to-game-purple-dark rounded-2xl flex items-center justify-center mb-4 shadow-game-glow"
                  variants={floatingVariants}
                  animate="animate"
                >
                  <Plus className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-2xl">Create Room</CardTitle>
                <CardDescription className="text-lg">
                  Start a new game and invite your friends to join the fun!
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-game-purple/20 text-game-purple border-game-purple/30"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      2-8 Players
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-game-teal/20 text-game-teal border-game-teal/30"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Real-time
                    </Badge>
                  </div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={handleCreateRoom}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-game-purple to-game-purple-dark hover:from-game-purple-dark hover:to-game-purple text-white font-semibold text-lg py-6"
                    >
                      {loading ? "Creating Room..." : "Create New Room"}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Room Card */}
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="relative overflow-hidden bg-gradient-to-br from-game-teal/10 to-game-teal/5 border-game-teal/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-game-teal/5 to-transparent" />
              <CardHeader className="relative z-10">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-game-teal to-game-teal-light rounded-2xl flex items-center justify-center mb-4 shadow-game-glow"
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: "1s" }}
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-2xl">Join Room</CardTitle>
                <CardDescription className="text-lg">
                  Enter a room code to join an existing game with friends!
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-game-orange/20 text-game-orange border-game-orange/30"
                    >
                      <GamepadIcon className="w-3 h-3 mr-1" />
                      Quick Join
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-game-success/20 text-game-success border-game-success/30"
                    >
                      Easy Setup
                    </Badge>
                  </div>

                  <Dialog
                    open={joinDialogOpen}
                    onOpenChange={setJoinDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button className="w-full bg-gradient-to-r from-game-teal to-game-teal-light hover:from-game-teal-light hover:to-game-teal text-white font-semibold text-lg py-6">
                          Join Existing Room
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle>Join a Room</DialogTitle>
                        <DialogDescription>
                          Enter the 6-character room code to join a game.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Enter room code (e.g., ABC123)"
                          value={roomCode}
                          onChange={(e) =>
                            setRoomCode(e.target.value.toUpperCase())
                          }
                          maxLength={6}
                          className="text-center text-xl font-mono tracking-wider"
                        />
                        <Button
                          onClick={handleJoinRoom}
                          disabled={roomCode.length !== 6}
                          className="w-full bg-gradient-to-r from-game-teal to-game-teal-light"
                        >
                          Join Room
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Error Dialog */}
        <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Room Not Found
              </DialogTitle>
              <DialogDescription className="text-center py-4">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setErrorDialogOpen(false);
                  setJoinDialogOpen(true); // Reopen join dialog
                  setRoomCode(''); // Clear the invalid code
                }}
                className="bg-game-purple hover:bg-game-purple-dark"
              >
                Try Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
