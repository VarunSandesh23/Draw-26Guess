import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoom, joinRoom, updateRoom, Player, GameRoom } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  Play, 
  Crown, 
  Check, 
  Clock, 
  Copy,
  UserPlus,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);

  // Load room data
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomCode || !user) return;
      
      try {
        const roomData = await getRoom(roomCode);
        if (!roomData) {
          toast.error('Room not found');
          navigate('/dashboard');
          return;
        }
        
        setRoom(roomData);
        
        // Auto-join the room if user is not already in it
        const isPlayerInRoom = roomData.players.some(p => p.uid === user.uid);
        if (!isPlayerInRoom) {
          setJoiningRoom(true);
          const newPlayer: Player = {
            uid: user.uid,
            name: userProfile?.displayName || 'Anonymous',
            photoURL: userProfile?.photoURL,
            score: 0,
            isReady: false
          };
          
          const success = await joinRoom(roomCode, newPlayer);
          if (success) {
            const updatedRoom = await getRoom(roomCode);
            setRoom(updatedRoom);
            toast.success('Joined room successfully!');
          }
          setJoiningRoom(false);
        } else {
          // Check if current user is ready
          const currentPlayer = roomData.players.find(p => p.uid === user.uid);
          setIsReady(currentPlayer?.isReady || false);
        }
      } catch (error) {
        console.error('Error loading room:', error);
        toast.error('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomCode, user, userProfile, navigate]);

  // Auto-refresh room data every 2 seconds
  useEffect(() => {
    if (!roomCode || !room) return;
    
    const interval = setInterval(async () => {
      try {
        const updatedRoom = await getRoom(roomCode);
        if (updatedRoom) {
          setRoom(updatedRoom);
          
          // Update ready state if it changed
          const currentPlayer = updatedRoom.players.find(p => p.uid === user?.uid);
          setIsReady(currentPlayer?.isReady || false);
          
          // Check if game started
          if (updatedRoom.started) {
            navigate(`/game/${roomCode}`);
          }
        }
      } catch (error) {
        console.error('Error refreshing room:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomCode, room, user, navigate]);

  const handleToggleReady = async () => {
    if (!room || !user || !roomCode) return;
    
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    
    // Update player ready state
    const updatedPlayers = room.players.map(player => 
      player.uid === user.uid 
        ? { ...player, isReady: newReadyState }
        : player
    );
    
    const success = await updateRoom(roomCode, { players: updatedPlayers });
    if (success) {
      toast.success(newReadyState ? 'You are ready!' : 'You are not ready');
    } else {
      setIsReady(!newReadyState); // Revert on failure
      toast.error('Failed to update ready state');
    }
  };

  const handleStartGame = async () => {
    if (!room || !user || !roomCode) return;
    
    // Check if user is room creator
    if (room.createdBy !== user.uid) {
      toast.error('Only the room creator can start the game');
      return;
    }
    
    // Check if at least 1 player and all are ready
    if (room.players.length < 1) {
      toast.error('Need at least 1 player to start');
      return;
    }
    
    const allReady = room.players.every(p => p.isReady);
    if (!allReady) {
      toast.error('All players must be ready to start');
      return;
    }
    
    // Start the game
    const success = await updateRoom(roomCode, { started: true });
    if (success) {
      toast.success('Game starting!');
      navigate(`/game/${roomCode}`);
    } else {
      toast.error('Failed to start game');
    }
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast.success('Room code copied to clipboard!');
    }
  };

  const isCreator = user && room && room.createdBy === user.uid;
  const allPlayersReady = room?.players.every(p => p.isReady) && room.players.length >= 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 flex items-center justify-center">
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Room not found</h2>
            <p className="text-muted-foreground mb-4">The room you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 bg-game-teal/20 rounded-full blur-3xl"
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-48 h-48 bg-game-orange/20 rounded-full blur-3xl"
          animate={{ y: [10, -10, 10], rotate: [2, -2, 2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
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
          {/* Room Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-game-purple/10 to-game-purple/5 border-game-purple/30">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-game-purple to-game-purple-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-game-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Game Lobby</CardTitle>
                <CardDescription className="text-lg">
                  Room Code: 
                  <button 
                    onClick={copyRoomCode}
                    className="font-mono text-xl font-bold ml-2 hover:text-game-purple transition-colors inline-flex items-center gap-1"
                  >
                    {roomCode}
                    <Copy className="w-4 h-4" />
                  </button>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-game-teal/20 text-game-teal border-game-teal/30">
                    <Users className="w-3 h-3 mr-1" />
                    {room.players.length}/8 Players
                  </Badge>
                  <Badge variant="secondary" className="bg-game-orange/20 text-game-orange border-game-orange/30">
                    <Settings className="w-3 h-3 mr-1" />
                    {room.maxRounds} Rounds
                  </Badge>
                  {room.started && (
                    <Badge className="bg-game-success">
                      <Play className="w-3 h-3 mr-1" />
                      Game Started
                    </Badge>
                  )}
                </div>

                {!room.started && (
                  <div className="space-y-3">
                    <Button
                      onClick={handleToggleReady}
                      variant={isReady ? "default" : "outline"}
                      className={`w-full ${isReady 
                        ? 'bg-game-success hover:bg-game-success/80' 
                        : 'border-game-purple text-game-purple hover:bg-game-purple/10'
                      }`}
                      disabled={joiningRoom}
                    >
                      {isReady ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Ready!
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Not Ready
                        </>
                      )}
                    </Button>

                    {isCreator && (
                      <Button
                        onClick={handleStartGame}
                        disabled={!allPlayersReady}
                        className="w-full bg-gradient-to-r from-game-orange to-game-orange-light hover:from-game-orange-light hover:to-game-orange"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {allPlayersReady ? 'Start Game' : 'Waiting for Players'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Players ({room.players.length})
                </CardTitle>
                <CardDescription>
                  {!room.started ? 'Waiting for all players to be ready...' : 'Game in progress'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {room.players.map((player, index) => (
                      <motion.div
                        key={player.uid}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all ${
                          player.isReady 
                            ? 'bg-game-success/10 border-game-success/30' 
                            : 'bg-card border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={player.photoURL || undefined} alt={player.name} />
                              <AvatarFallback className="bg-gradient-to-br from-game-purple to-game-teal text-white">
                                {player.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{player.name}</p>
                                {room.createdBy === player.uid && (
                                  <Crown className="w-4 h-4 text-game-orange" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Score: {player.score}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {player.isReady ? (
                              <Badge className="bg-game-success">
                                <Check className="w-3 h-3 mr-1" />
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                Waiting
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 8 - room.players.length) }).map((_, index) => (
                    <motion.div
                      key={`empty-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (room.players.length + index) * 0.1 }}
                      className="p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
                    >
                      <div className="text-center text-muted-foreground">
                        <UserPlus className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">Waiting for player...</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
